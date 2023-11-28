from pytz import timezone
from datetime import datetime
from get_student_data import get_student_data
from take_attendance import take_attendance

# Convert current time to CST
current_time = datetime.now(timezone("US/Central")).strftime("%H:%M")

# If current time is 3:30 PM CST, run the functions
if current_time == "15:30":
    get_student_data()
    take_attendance()
    print("Ran test functions")
    # save to log file in data
    log_file = open("data/log.txt", "a")
    log_file.write(f"Ran test functions at {current_time}\n")
    log_file.close()

else:
    print("Did not run test functions")
    # save to log file in data
    log_file = open("data/log.txt", "a")
    log_file.write(f"Did not run test functions at {current_time}\n")
    log_file.close()
