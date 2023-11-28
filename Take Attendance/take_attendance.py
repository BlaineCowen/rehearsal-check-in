from datetime import datetime
from operator import contains
from unittest import skip
import selenium
from selenium import webdriver
import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from dotenv import load_dotenv
from pathlib import Path
import re


import pandas as pd
import time
import datetime
import os
import numpy as np
import json


# make a tuple for 1st, 2nd, 5th, 6th, and 7th periods
# the first number should be the start time, the 2nd the end time
# time should be in datetime format

# first_per = [datetime.time(5), datetime.time(8, 15)]
# second_per = [datetime.time(8, 00), datetime.time(9, 15)]
# fifth_per = [datetime.time(11, 30), datetime.time(12, 45)]
# sixth_per = [datetime.time(12, 46), datetime.time(13, 40)]
# seventh_per = [datetime.time(13, 41), datetime.time(14, 45)]


def take_attendance():
    # get the env variables
    env_path = Path(".") / ".env.local"
    load_dotenv(dotenv_path=env_path)

    def get_google_sheet_data():
        # Use credentials to create a client to interact with the Google Drive API
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        application_creds = os.getenv("APPLICATION_CREDENTIALS")

        application_creds = os.getenv("APPLICATION_CREDENTIALS")
        creds_dict = json.loads(application_creds)

        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        client = gspread.authorize(creds)

        # Open the Google spreadsheet
        sheet_id = os.getenv("SHEET_ID")
        sheet = client.open_by_key(os.getenv("SHEET_ID"))

        # Get the first sheet of the spreadsheet
        worksheet = sheet.get_worksheet(0)

        # Get all values from the worksheet
        data = worksheet.get_all_values()
        # make headers row 1
        data = pd.DataFrame(data[1:], columns=data[0])

        # date format looks like this 2023-08-04T17:02:30.624Z
        # get a list of IDs where Date and Time is today
        # get current day
        current_day = datetime.datetime.today().strftime("%Y-%m-%d")
        # data=data where Date and Time is today
        data = data[data["Date and Time"].str.contains(current_day)]
        # just return list of IDS
        ids = data["ID"].tolist()

        # Convert the data to a pandas DataFrame and return it
        return ids

    skyward_student_data = pd.read_csv("data/browse.csv")
    # students ids is the email address but only the numbers
    # use regex to get only the numbers
    skyward_student_data["ID"] = skyward_student_data["Email Address"].str.extract(
        "(\d+)"
    )
    skyward_student_data["ID"] = skyward_student_data["ID"].astype(int)

    present_students = get_google_sheet_data()
    present_student_df = pd.DataFrame(present_students, columns=["ID"])
    # if ID doesn't begin with a 0, add a 0 to the beginning
    # get rid of IDs what are ""
    present_student_df = present_student_df[present_student_df["ID"] != ""]
    # get rid of any that can't be parsed as int
    present_student_df = present_student_df[
        present_student_df["ID"].astype(str).str.isdigit()
    ]

    present_student_df["ID"] = present_student_df["ID"].astype(int)
    present_student_df["First Name"] = ""
    present_student_df["Last Name"] = ""
    # merge the two dataframes on present_student_df[ID] only
    merged_df = pd.merge(
        present_student_df, skyward_student_data, how="left", on=["ID"], indicator=True
    )
    merged_df = merged_df[merged_df["_merge"] == "both"]
    merged_df = merged_df.drop(columns=["_merge"])
    merged_df = merged_df.drop_duplicates(subset=["ID"])
    merged_df = merged_df.drop(columns=["Email Address"])

    # only get first name, last name and ID
    merged_df = merged_df[["First Name", "Last Name", "ID"]]
    merged_df = merged_df.sort_values(by=["Last Name", "First Name"])

    print(merged_df)
    # get current day and time
    current_time = datetime.datetime.now().time()
    merged_df.to_csv(f"data/present_students_{current_time}.csv", index=False)

    def take_attendance_loop():
        skyward_attendance_url = "https://skyward.iscorp.com/PasadenaTXStu/Attendance/DailyAttendance/Sections?w=e721a0657e744d429cd2f277ca4b5368&p=ba7ec27411cd49f8ac371548e9395528"

        # Set up Chrome options
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_experimental_option(
            "prefs",
            {
                "download.default_directory": r"./data",
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safebrowsing.enabled": True,
            },
        )

        driver = webdriver.Chrome(options=chrome_options)
        # get username and password from .env.local

        env_path = Path(".") / ".env.local"
        load_dotenv(dotenv_path=env_path)

        username = os.getenv("USERNAME")
        password = os.getenv("PASSWORD")

        driver.get(skyward_attendance_url)

        username_field = driver.find_element(By.NAME, "UserName")
        username_field.send_keys(username)

        password_field = driver.find_element(By.NAME, "Password")
        password_field.send_keys(password)

        login_button = driver.find_element(By.XPATH, "//button[@value='Sign In']")
        login_button.click()

        # load page again
        driver.get(skyward_attendance_url)

        # wait for div with class tileBrowseBodyContainer__tileSection to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(
                (By.CLASS_NAME, "tileBrowseBodyContainer__tileSection")
            )
        )
        # get a list of divs directly under that div
        divs = driver.find_elements(
            By.XPATH, "//div[@class='tileBrowseBodyContainer__tileSection']/div"
        )

        for i in range(len(divs)):
            # /wait until period is loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.CLASS_NAME, "tileBrowseBodyContainer__tileSection")
                )
            )
            # click on the period tile
            period = driver.find_element(
                By.XPATH, f"//div[@ID='SectionsByPeriod_Tile{i}']"
            )
            period.click()
            # wait for the attendance table to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(
                    (By.ID, "DailyAttendance_lockedBodyTable")
                )
            )
            table = driver.find_element(By.ID, "DailyAttendance_lockedBodyTable")
            # get all the rows in the table
            rows = table.find_elements(By.TAG_NAME, "tr")
            # the id is in td[4]
            for row in rows:
                # get the id
                id = row.find_elements(By.TAG_NAME, "td")[4].text
                # find the row number of element
                row_number = row.get_attribute("data-row")
                # if the id is not in present_students, click on the absent checkbox
                if id in present_students or id[1:] in present_students:
                    print(f"{id} is present")
                    continue

                if id not in present_students and id[1:] not in present_students:
                    # absent checkbox is in data-column 5, the row will be the id row
                    absent_checkbox = table.find_element(
                        By.XPATH, f"//td[@data-row='{row_number}' and @data-column='5']"
                    )
                    # find the input element
                    try:
                        absent_checkbox = absent_checkbox.find_element(
                            By.TAG_NAME, "input"
                        )
                        absent_checkbox.click()
                    except:
                        pass
            try:
                # click the save and back button id=DailyAttendance_AttendanceSaveAndBack
                save_and_back_button = driver.find_element(
                    By.ID, "DailyAttendance_AttendanceSaveAndBack"
                )
                save_and_back_button.click()
                # if a popup appears, hit ok
            except:
                print("no save and back button attendance already taken")
                # go back in browser
                driver.back()
            try:
                alert = driver.switch_to.alert
                alert.accept()
            except:
                pass
            try:
                # wait for id=confirmPerfectAttendance to load
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "confirmPerfectAttendance"))
                )
                # click the confirm button
                confirm_button = driver.find_element(By.ID, "confirmPerfectAttendance")
                confirm_button.click()
            except:
                pass
            time.sleep(1)

        return present_students

    take_attendance_loop()


if __name__ == "__main__":
    take_attendance()
