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
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/trigger_service.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


def load_config():
    """Load configuration from config.json file."""
    config_path = Path(__file__).parent / 'config.json'
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Validate required fields
        if 'url' not in config:
            raise ValueError("Missing 'url' in configuration")
        if 'port' not in config:
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
        logger.info(f"Successfully sent GET request to {url} - Status: {response.status_code}")
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


def main():
    """Main service loop."""
    logger.info("Starting Periodic GET Request Service")
    
    # Load configuration
    config = load_config()
    base_url = config['url']
    port = config['port']
    interval = config.get('interval_seconds', 60)  # Default to 60 seconds
    
    # Construct full URL
    if port:
        full_url = f"{base_url}:{port}"
    else:
        full_url = base_url
    
    # Add endpoint path if specified
    endpoint = config.get('endpoint', '')
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
