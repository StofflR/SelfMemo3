import sys
import subprocess
import signal
import time
import json
from pathlib import Path
from threading import Thread

# Store process references
processes = []


def signal_handler(signum, frame):
    """Handle Ctrl+C to gracefully stop all processes."""
    print("\n\nStopping all services...")
    for proc in processes:
        if proc.poll() is None:  # Process is still running
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
    print("All services stopped")
    sys.exit(0)


def check_node_installed():
    """Check if Node.js and npm are installed."""
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        subprocess.run(["npm", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def check_python_requirements():
    """Check if required Python packages are installed."""
    try:
        import requests

        return True
    except ImportError:
        return False


def install_python_requirements():
    """Install Python requirements."""
    print("Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "requests"], check=True)
        print("Python dependencies installed\n")
        return True
    except subprocess.CalledProcessError:
        print("Failed to install Python dependencies")
        return False


def load_config():
    """Load configuration from config.json."""
    config_path = Path(__file__).parent / "config.json"
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"WARNING: Config file not found at {config_path}, using defaults")
        return {
            "url": "http://localhost",
            "port": 3000,
            "endpoint": "/api/reminders/trigger",
            "interval_seconds": 60,
        }


def run_trigger_service():
    """Run the trigger service in a subprocess."""
    print("Starting Trigger Service...")
    trigger_script = Path(__file__).parent / "app" / "trigger_service.py"
    log_file = Path.cwd() / "trigger_service.log"

    if not trigger_script.exists():
        print(f"ERROR: Trigger service script not found at {trigger_script}")
        return None

    try:
        # Run trigger service with unbuffered output and log file in cwd
        proc = subprocess.Popen(
            [sys.executable, "-u", str(trigger_script), "--log-file", str(log_file)],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        # Monitor output in a separate thread
        def monitor_output():
            for line in proc.stdout:
                print(f"[TRIGGER] {line.rstrip()}")

        Thread(target=monitor_output, daemon=True).start()
        print("Trigger Service started\n")
        return proc
    except Exception as e:
        print(f"ERROR: Failed to start trigger service: {e}")
        return None


def run_npm_build_and_start():
    """Build and start the Next.js application."""
    project_root = Path(__file__).parent.parent

    print("Building Next.js application...")
    print(f"   Working directory: {project_root}\n")

    # Run npm build
    try:
        build_proc = subprocess.Popen(
            ["npm", "run", "build"],
            cwd=project_root,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        # Show build output
        for line in build_proc.stdout:
            print(f"[BUILD] {line.rstrip()}")

        build_proc.wait()

        if build_proc.returncode != 0:
            print("ERROR: Build failed!")
            return None

        print("Build completed successfully\n")
    except Exception as e:
        print(f"ERROR: Build error: {e}")
        return None

    # Start the application
    print("Starting Next.js application...")
    try:
        start_proc = subprocess.Popen(
            ["npm", "start"],
            cwd=project_root,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        # Monitor output in a separate thread
        def monitor_output():
            for line in start_proc.stdout:
                print(f"[APP] {line.rstrip()}")

        Thread(target=monitor_output, daemon=True).start()

        # Give it a moment to start
        time.sleep(2)

        if start_proc.poll() is not None:
            print("ERROR: Application failed to start")
            return None

        print("Application started\n")
        return start_proc
    except Exception as e:
        print(f"ERROR: Failed to start application: {e}")
        return None


def seed_database(config, max_retries=10, retry_delay=3):
    """Seed the database by calling the seed API endpoint."""
    print("Seeding database...")
    seed_url = f"{config['url']}:{config['port']}/api/seed"
    
    for attempt in range(1, max_retries + 1):
        try:
            import requests
            response = requests.get(seed_url, timeout=10)
            if response.status_code == 200:
                print(f"Database seeded successfully: {response.text}\n")
                return True
            else:
                print(f"Seed endpoint returned status {response.status_code}: {response.text}")
                return False
        except requests.exceptions.ConnectionError:
            if attempt < max_retries:
                print(f"   Attempt {attempt}/{max_retries}: Application not ready yet, retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                print(f"ERROR: Failed to connect to seed endpoint after {max_retries} attempts")
                return False
        except Exception as e:
            print(f"ERROR: Failed to seed database: {e}")
            return False
    
    return False


def main():
    """Main execution."""
    # Set up signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("=" * 60)
    print("SelfMemo3 - Local Development Runner")
    print("=" * 60)
    print()

    # Check prerequisites
    print("Checking prerequisites...")

    if not check_node_installed():
        print("ERROR: Node.js/npm not found. Please install Node.js first.")
        sys.exit(1)
    print("Node.js and npm found")

    if not check_python_requirements():
        print("WARNING: Python 'requests' package not found")
        if not install_python_requirements():
            sys.exit(1)
    else:
        print("Python requirements satisfied")

    print()

    # Load configuration
    config = load_config()
    print(f"Configuration:")
    print(f"   URL: {config['url']}:{config['port']}")
    print(f"   Endpoint: {config['endpoint']}")
    print(f"   Check interval: {config['interval_seconds']} seconds")
    print()

    # Start trigger service
    trigger_proc = run_trigger_service()
    if trigger_proc:
        processes.append(trigger_proc)

    # Small delay to let trigger service initialize
    time.sleep(1)

    # Build and start Next.js app
    app_proc = run_npm_build_and_start()
    if app_proc:
        processes.append(app_proc)
        # Seed the database after application starts
        seed_database(config)
    else:
        print("ERROR: Failed to start application. Stopping all services...")
        signal_handler(None, None)

    # Display running info
    print("=" * 60)
    print("SelfMemo3 is now running locally!")
    print("=" * 60)
    print(f"Application: {config['url']}:{config['port']}")
    print(f"Trigger Service: Running (checking every {config['interval_seconds']}s)")
    print()
    print("Press Ctrl+C to stop all services")
    print("=" * 60)
    print()

    # Keep the script running
    try:
        while True:
            # Check if processes are still running
            for proc in processes:
                if proc.poll() is not None:
                    print(f"\nWARNING: A process has stopped unexpectedly")
                    signal_handler(None, None)
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)


if __name__ == "__main__":
    main()
