import os
import sys
import shutil
import subprocess
import json
from pathlib import Path

USER = "selfmemo"
LOG_PATH = "/var/log"
SYSTEM_PATH = "/etc/systemd/system/"

def check_root():
    """Check if script is run as root."""
    if os.geteuid() != 0:
        print("ERROR: This script must be run as root (use sudo)")
        sys.exit(1)


def create_directory(path):
    """Create directory if it doesn't exist."""
    path = Path(path)
    if not path.exists():
        path.mkdir(parents=True, mode=0o755)


def copy_file(source, destination, mode=0o644):
    """Copy file to destination with specified permissions."""
    source = Path(source)
    destination = Path(destination)
    
    if not source.exists():
        print(f"ERROR: Source file not found: {source}")
        sys.exit(1)
    
    shutil.copy2(source, destination)
    os.chmod(destination, mode)


def install_python_requirements():
    """Install required Python packages."""
    print("\n>>> Installing Python dependencies...")
    try:
        subprocess.run(
            ["apt-get", "install", "-y", "python3-requests"],
            check=True,
            capture_output=True
        )
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to install Python dependencies: {e}")
        sys.exit(1)


def reload_systemd():
    """Reload systemd daemon."""
    print("\n>>> Reloading systemd daemon...")
    try:
        subprocess.run(["systemctl", "daemon-reload"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to reload systemd: {e}")


def enable_service(service_name):
    """Enable service to start on boot."""
    print(f"\n>>> Enabling {service_name}...")
    try:
        subprocess.run(["systemctl", "enable", service_name], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to enable service: {e}")


def start_service(service_name):
    """Start the service."""
    print(f"\n>>> Starting {service_name}...")
    try:
        subprocess.run(["systemctl", "start", service_name], check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to start service: {e}")
        print("Check logs with: journalctl -u trigger_service -f")


def get_service_status(service_name):
    """Display service status."""
    print(f"\n>>> Service status:")
    subprocess.run(["systemctl", "status", service_name, "--no-pager"])


def create_log_file():
    """Create log file with appropriate permissions."""
    log_file = Path(LOG_PATH) / "trigger_service.log"
    if not log_file.exists():
        log_file.touch(mode=0o644)
    
    # Set ownership to selfmemo user (used by the service)
    try:
        subprocess.run(["chown", f"{USER}:{USER}", str(log_file)], check=True)
    except subprocess.CalledProcessError as e:
        print(f"WARNING: Failed to set log file ownership: {e}")


def create_service_user():
    """Create selfmemo user and group for running services."""
    print(f"\n>>> Creating service user and group {USER}...")
    
    # Check if group exists
    group_check = subprocess.run(
        ["getent", "group", USER],
        capture_output=True
    )
    
    if group_check.returncode != 0:
        try:
            subprocess.run(["groupadd", "--system", USER], check=True)
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Failed to create {USER} group: {e}")
            return False
    
    # Check if user exists
    user_check = subprocess.run(
        ["id", "-u", USER],
        capture_output=True
    )
    
    if user_check.returncode != 0:
        try:
            subprocess.run([
                "useradd", "--system", "--no-create-home",
                "--shell", "/usr/sbin/nologin",
                "-g", USER, USER
            ], check=True)
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Failed to create {USER} user: {e}")
            return False
    return True


def load_config():
    """Load configuration from config.json."""
    script_dir = Path(__file__).parent.absolute()
    config_path = script_dir / "config.json"
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"ERROR: Configuration file not found at {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid JSON in configuration file: {e}")
        sys.exit(1)
