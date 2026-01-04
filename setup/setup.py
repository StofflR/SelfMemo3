#!/usr/bin/env python3
"""
Setup script for Periodic GET Request Trigger Service
Installs the service files to the correct system locations.
"""

import os
import sys
import shutil
import subprocess
import json
from pathlib import Path
from util import *
from app.setup import *
from postgres.setup import *

def main():
    """Main setup routine."""
    print("=" * 60)
    print("SelfMemo3 - Complete Setup Script")
    print("=" * 60)
    
    # Check root privileges
    check_root()
    
    # Create service user first
    if not create_service_user():
        print("ERROR: Failed to create service user")
        sys.exit(1)
    
    # Load configuration
    config = load_config()
    
    # Ask what to install
    print("\nWhat would you like to install?")
    print("1) SelfMemo3 Application only")
    print("2) Trigger Service only")
    print("3) PostgreSQL Database setup only")
    print("4) Everything (Application + Trigger + Database)")
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    install_app = choice in ['1', '4']
    install_trigger = choice in ['2', '4']
    install_db = choice in ['3', '4']
    
    if not (install_app or install_trigger or install_db):
        print("Invalid choice. Exiting.")
        sys.exit(1)
    
    success = True
    
    if install_trigger:
        if not install_trigger_service():
            success = False
            print("\nTrigger service installation encountered errors")
    
    if install_db:
        if not setup_postgresql_database(config):
            print("\nDatabase setup encountered errors")
            response = input("Continue with other installations? (y/n): ")
            if response.lower() not in ['y', 'yes']:
                sys.exit(1)
    
    if install_app:
        if not install_nodejs_app():
            success = False
            print("\nApplication installation encountered errors")
        print("\n" + "=" * 60)
        print("Sync Application Database")
        print("=" * 60)
        response = input("Would you like to sync the database now? (y/n): ")
        if response.lower() in ['y', 'yes']:
            if not sync_application_database():
                print("Database sync encountered errors")
                
    if not success:
        print("\n" + "=" * 60)
        print("Installation completed with errors")
        print("=" * 60)
        sys.exit(1)
    else:
        print("\n" + "=" * 60)
        print("Installation completed successfully")
        print("=" * 60)
        if install_db:
            print("IMPORTANT: Update your .env file with the correct database connection details before starting the application.")
            print("The database URL is: " + "postgresql://{user}:{password}@localhost:{port}/{db_name}".format(
                user=config['database']['username'],
                password=config['database']['password'],
                port=config['database']['port'],
                db_name=config['database']['name']
            ))
    
    # Reload systemd if services were installed
    if install_app or install_trigger:
        reload_systemd()
        
        # Ask user if they want to enable and start the services
        print("\n" + "=" * 60)
        response = input("Do you want to enable and start the service(s) now? (y/n): ")
        
        if response.lower() in ['y', 'yes']:
            if install_app:
                enable_service("selfmemo.service")
                start_service("selfmemo.service")
            
            if install_trigger:
                enable_service("trigger_service.service")
                start_service("trigger_service.service")
            
            print("\n>>> Service Status:")
            if install_app:
                get_service_status("selfmemo.service")
            if install_trigger:
                get_service_status("trigger_service.service")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nERROR: Unexpected error during setup: {e}")
        sys.exit(1)
