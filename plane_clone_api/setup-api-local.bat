@echo off
setlocal enabledelayedexpansion

REM Call the Python script to wait for the database
call python manage.py wait_for_db

REM Wait for migrations
call python manage.py wait_for_migrations

REM Get system information
for /f "tokens=*" %%A in ('hostname') do set HOSTNAME=%%A
for /f "tokens=1 delims=," %%A in ('getmac /FO CSV /NH') do set MAC_ADDRESS=%%A
for /f "tokens=*" %%A in ('wmic cpu get caption') do set CPU_INFO=%%A
for /f "tokens=*" %%A in ('systeminfo ^| findstr /C:"Total Physical Memory"') do set MEMORY_INFO=%%A
for /f "tokens=*" %%A in ('wmic logicaldisk get size,freespace,caption') do set DISK_INFO=%%A

REM Concatenate system info
set SIGNATURE=%HOSTNAME%%MAC_ADDRESS%%CPU_INFO%%MEMORY_INFO%%DISK_INFO%

REM Save signature to a temporary file to compute the SHA-256 hash
echo %SIGNATURE% > signature.txt
for /f "tokens=* usebackq" %%A in (`certutil -hashfile signature.txt SHA256 ^| findstr /v "CertUtil"`) do set MACHINE_SIGNATURE=%%A
del signature.txt

REM Export the signature as an environment variable
set MACHINE_SIGNATURE=%MACHINE_SIGNATURE%

REM Register instance
call python manage.py register_instance %MACHINE_SIGNATURE%

REM Load configuration
call python manage.py configure_instance

REM Create the default bucket
call python manage.py create_bucket

REM Clear cache before starting to remove stale values
call python manage.py clear_cache

REM Start the server
call python manage.py runserver --settings=plane.settings.local

endlocal
