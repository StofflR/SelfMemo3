#!/usr/bin/env python3
"""
Periodic GET Request Service
Sends GET requests to a configured endpoint every minute.
"""

import time
import logging
import sys
from pathlib import Path
import json
import requests
import argparse
from datetime import datetime

logger = logging.getLogger(__name__)


def load_config():
    """Load configuration from config.json file."""
    config_path = Path(__file__).parent.parent / "config.json"

    try:
        with open(config_path, "r") as f:
            config = json.load(f)

        # Validate required fields
        if "url" not in config:
            raise ValueError("Missing 'url' in configuration")
        if "port" not in config:
            raise ValueError("Missing 'port' in configuration")

        return config
    except FileNotFoundError:
        logger.error(f"Configuration file not found at {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in configuration file: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error loading configuration: {e}")
        sys.exit(1)


def send_get_request(url, timeout=30):
    """Send GET request to the specified URL."""
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        logger.info(
            f"Successfully sent GET request to {url} - Status: {response.status_code}"
        )
        return True
    except requests.exceptions.Timeout:
        logger.error(f"Request to {url} timed out")
        return False
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error to {url}: {e}")
        return False
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error for {url}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending request to {url}: {e}")
        return False


def setup_logging(log_file_path):
    """Setup logging with the specified log file path."""
    log_file = Path(log_file_path)

    # Ensure log directory exists
    log_file.parent.mkdir(parents=True, exist_ok=True)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout),
        ],
    )


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Periodic GET Request Trigger Service",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Use default log location (/var/log/trigger_service.log)
  %(prog)s --log-file ./trigger_service.log  # Use current directory
  %(prog)s --log-file ~/logs/trigger.log     # Use home directory
        """,
    )

    parser.add_argument(
        "--log-file",
        type=str,
        default="/var/log/trigger_service.log",
        help="Path to the log file (default: /var/log/trigger_service.log)",
    )

    return parser.parse_args()


def main():
    """Main service loop."""
    # Parse command line arguments
    args = parse_arguments()

    # Setup logging
    setup_logging(args.log_file)

    logger.info("Starting Periodic GET Request Service")
    logger.info(f"Log file: {args.log_file}")

    # Load configuration
    config = load_config()
    base_url = config["url"]
    port = config["port"]
    interval = config.get("interval_seconds", 60)  # Default to 60 seconds

    # Construct full URL
    if port:
        full_url = f"{base_url}:{port}"
    else:
        full_url = base_url

    # Add endpoint path if specified
    endpoint = config.get("endpoint", "")
    if endpoint:
        full_url = f"{full_url}{endpoint}"

    logger.info(f"Configured to send GET requests to: {full_url}")
    logger.info(f"Interval: {interval} seconds")

    # Main loop
    while True:
        try:
            send_get_request(full_url)
            time.sleep(interval)
        except KeyboardInterrupt:
            logger.info("Service stopped by user")
            sys.exit(0)
        except Exception as e:
            logger.error(f"Unexpected error in main loop: {e}")
            time.sleep(interval)


if __name__ == "__main__":
    main()
