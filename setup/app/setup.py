from pathlib import Path
import sys
sys.path.append('..')
from util import *



SERVICE_DIR = Path("/opt/trigger_service")

def install_trigger_service():
    """Install the trigger service."""
    print("\n" + "=" * 60)
    print("Installing Periodic GET Request Trigger Service")
    print("=" * 60)
    
    service_file_dst = Path(SYSTEM_PATH) / "trigger_service.service"
    script_dir = Path(__file__).parent.absolute()
    service_file_src = script_dir / "trigger_service.service"
    python_script_src = script_dir / "trigger_service.py"
    config_file_src = script_dir.parent / "config.json"
    
    # Create installation directory
    create_directory(SERVICE_DIR)
    
    # Copy Python script
    copy_file(python_script_src, SERVICE_DIR / "trigger_service.py", mode=0o755)
    copy_file(config_file_src, SERVICE_DIR / "config.json", mode=0o644)
    
    # Copy systemd service file
    copy_file(service_file_src, service_file_dst, mode=0o644)
    
    # Create log file
    create_log_file()
    
    # Install Python dependencies
    install_python_requirements()
    
    # Set ownership of trigger service directory to selfmemo user
    print("\n>>> Setting ownership of trigger service directory...")
    try:
        subprocess.run(["chown", "-R", "selfmemo:selfmemo", str(SERVICE_DIR)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to set directory ownership: {e}")
    return True



def install_nodejs_app():
    """Install the Next.js application."""
    print("\n" + "=" * 60)
    print("Installing SelfMemo3 Next.js Application")
    print("=" * 60)
    
    # Check if npm is installed
    if not shutil.which("npm"):
        print("\n>>> npm is not installed. Installing Node.js and npm...")
        if shutil.which("apt-get"):
            try:
                subprocess.run(["apt-get", "update"], check=True)
                subprocess.run(["apt-get", "install", "-y", "nodejs", "npm"], check=True)
            except subprocess.CalledProcessError as e:
                print(f"ERROR: Failed to install Node.js and npm: {e}")
                return False
        else:
            print("ERROR: No supported package manager found (apt-get required)")
            print("Please install Node.js and npm manually")
            return False
    
    script_dir = Path(__file__).parent.absolute()
    service_file_src = script_dir / "selfmemo.service"
    service_file_dst = Path(SYSTEM_PATH) / "selfmemo.service"
    app_dir = Path(__file__).parent.parent.parent.absolute()
    
    # Update systemd service file to use the current directory
    print("\n>>> Updating systemd service file...")
    try:
        with open(service_file_src, 'r') as f:
            service_content = f.read()
        
        # Replace /opt/selfmemo with actual script directory
        service_content = service_content.replace('/opt/selfmemo', str(app_dir))
        
        with open(service_file_dst, 'w') as f:
            f.write(service_content)
        os.chmod(service_file_dst, 0o644)
    except Exception as e:
        print(f"ERROR: Failed to install service file: {e}")
        return False
    
    # Create log file
    log_file = Path(LOG_PATH) / "selfmemo.log"
    if not log_file.exists():
        log_file.touch(mode=0o644)
    
    # Set ownership to selfmemo user (used by the service)
    try:
        subprocess.run(["chown", f"{USER}:{USER}", str(log_file)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to set log file ownership: {e}")
    
    # Check for .env file
    env_file = app_dir / ".env"
    if not env_file.exists():
        print("\n⚠ WARNING: .env file not found!")
        print(f"Please create {env_file} with your configuration before starting the service.")
        print("You can copy from .env.example if available.")
    
    # Install npm dependencies and build in the current directory
    print("\n>>> Installing Node.js dependencies...")
    try:
        subprocess.run(["npm", "install"], cwd=app_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to install npm dependencies: {e}")
        return False
    
    print("\n>>> Building Next.js application...")
    try:
        subprocess.run(["npm", "run", "build"], cwd=app_dir, check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to build application: {e}")
        return False
    
    # Set ownership of application directory to selfmemo user
    print("\n>>> Setting ownership of application directory...")
    try:
        subprocess.run(["chown", "-R", f"{USER}:{USER}", str(app_dir)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to set directory ownership: {e}")
    
        # Ensure parent directories are accessible by selfmemo user
    print("\n>>> Ensuring parent directory permissions...")
    parent_dir = app_dir.parent
    try:
        # Check current permissions
        stat_result = os.stat(parent_dir)
        current_mode = stat_result.st_mode & 0o777
        
        # If parent directory doesn't have execute permission for others, set it to 711
        if not (current_mode & 0o001):
            subprocess.run(["chmod", "711", str(parent_dir)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to set parent directory permissions: {e}")
        print(f"You may need to manually run: sudo chmod 711 {parent_dir}")
    except Exception as e:
        print(f"WARNING: Could not check parent directory permissions: {e}")
    
    return True
