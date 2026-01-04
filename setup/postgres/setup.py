import subprocess
import shutil
import sys
sys.path.append('..')
from util import *

def check_postgres_installed():
    """Check if PostgreSQL is installed."""
    try:
        result = subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False

def install_postgresql():
    """Install PostgreSQL server."""
    print("\n>>> Installing PostgreSQL...")
    
    # Detect package manager
    if shutil.which("apt-get"):
        try:
            subprocess.run(["apt-get", "update"], check=True)
            subprocess.run(["apt-get", "install", "-y", "postgresql", "postgresql-contrib"], check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Failed to install PostgreSQL via apt: {e}")
            return False
    else:
        print("ERROR: No supported package manager found (apt-get required)")
        print("Please install PostgreSQL manually")
        return False
        
def setup_postgresql_database(config):
    """Set up PostgreSQL database and user."""
    print("\n" + "=" * 60)
    print("Setting up PostgreSQL Database")
    print("=" * 60)
    
    # Check if PostgreSQL is installed
    if not check_postgres_installed():
        print("PostgreSQL is not installed.")
        response = input("Would you like to install PostgreSQL now? (y/n): ")
        if response.lower() in ['y', 'yes']:
            if not install_postgresql():
                return False
            
            # Start and enable PostgreSQL service
            print("\n>>> Starting PostgreSQL service...")
            try:
                subprocess.run(["systemctl", "start", "postgresql"], check=True)
                subprocess.run(["systemctl", "enable", "postgresql"], check=True)
            except subprocess.CalledProcessError as e:
                print(f"ERROR: Failed to start PostgreSQL service: {e}")
                return False
        else:
            print("Skipping PostgreSQL setup")
            return False
    
    # Get database credentials from config
    db_config = config.get('database', {})
    db_name = db_config.get('name', 'selfmemo')
    db_user = db_config.get('username', 'selfmemo_user')
    db_password = db_config.get('password', 'your_secure_password_here')
    db_port = db_config.get('port', 5432)
    
    if db_password == 'your_secure_password_here':
        print("\n⚠ WARNING: Using default password from config.json")
        print("Please update the password in config.json for production use")
        response = input("Continue with default password? (y/n): ")
        if response.lower() not in ['y', 'yes']:
            print("Please update config.json and run setup again")
            return False
    
    print(f"\nDatabase: {db_name}")
    print(f"User: {db_user}")
    
    # Create SQL commands
    create_user_sql = f"""
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{db_user}') THEN
        CREATE USER {db_user} WITH PASSWORD '{db_password}' CREATEDB;
    END IF;
END
$$;
"""
    
    grant_privileges_sql = f"""
GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};
"""
    
    try:
        # Create user
        print("\n>>> Creating database user...")
        subprocess.run(
            ["sudo", "-u", "postgres", "psql", "-c", create_user_sql],
            check=True,
            capture_output=True
        )
        
        # Create database (check if it exists first)
        print(f">>> Creating database '{db_name}'...")
        check_db_result = subprocess.run(
            ["sudo", "-u", "postgres", "psql", "-tAc", 
             f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"],
            capture_output=True,
            text=True
        )
        
        if not check_db_result.stdout.strip():
            # Database doesn't exist, create it
            subprocess.run(
                ["sudo", "-u", "postgres", "psql", "-c", 
                 f"CREATE DATABASE {db_name} OWNER {db_user}"],
                check=True,
                capture_output=True
            )
        
        # Grant privileges
        subprocess.run(
            ["sudo", "-u", "postgres", "psql", "-c", grant_privileges_sql],
            check=True,
            capture_output=True
        )

        subprocess.run(
            ["sudo", "-u", "postgres", "psql", "-c", f"ALTER USER {db_user} WITH CREATEDB;"],
        )

        # Generate DATABASE_URL
        database_url = f"postgresql://{db_user}:{db_password}@localhost:5432/{db_name}"
        
        print("\n" + "=" * 60)
        print("PostgreSQL setup complete!")
        print("=" * 60)
        print(f"\nAdd this to your .env file:")
        print(f"DATABASE_URL=\"{database_url}\"")
        print("\nOr if using direct connection:")
        print(f"DB_HOST=localhost")
        print(f"DB_PORT={db_port}")
        print(f"DB_NAME={db_name}")
        print(f"DB_USER={db_user}")
        print(f"DB_PASSWORD={db_password}")
        print("=" * 60)
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to set up database: {e}")
        if e.stderr:
            print(f"Details: {e.stderr.decode()}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error during database setup: {e}")
        return False


def sync_application_database():
    """Sync the application database using Prisma."""
    print("\n>>> Syncing application database with Prisma...")
    try:
        subprocess.run(
            ["sudo", "npx", "prisma", "migrate", "deploy"],
            check=True
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to sync database: {e}")
        return False