import selenium
from selenium import webdriver
import chromedriver_autoinstaller
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import time
import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


def get_student_data():
    # Set up Chrome options
    prefs = {
        "download.default_directory": os.path.abspath("data"),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True,
        "profile.default_content_setting_values.automatic_downloads": 1,  # Allow automatic downloads
    }
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(options=chrome_options)
    # get username and password from .env.local

    # delete browse.csv if exists
    if os.path.exists("data/browse.csv"):
        os.remove("data/browse.csv")

    env_path = Path(".") / ".env.local"
    load_dotenv(dotenv_path=env_path)

    username = os.getenv("USERNAME")
    password = os.getenv("PASSWORD")

    skyward_student_list_url = "https://skyward.iscorp.com/PasadenaTXStu/Student/Student/TeacherStudentList?w=164a7bae48a04b40a12428d4ae37ee53&p=17638f16477b46388dbc93df42494006"

    # Set up WebDriver

    driver.get(skyward_student_list_url)

    # login is an input with the name="Username"
    # type username in username
    # type password in password
    # click login

    username_field = driver.find_element(By.NAME, "UserName")
    username_field.send_keys(username)

    password_field = driver.find_element(By.NAME, "Password")
    password_field.send_keys(password)

    login_button = driver.find_element(By.XPATH, "//button[@value='Sign In']")
    login_button.click()

    # wait for the page to load

    # load url again
    driver.get(skyward_student_list_url)
    # more_button = driver.find_element(
    #     By.XPATH,
    #     "//a[@data-automation-id='TeacherStudentList_MoreMenuArea_Button']",
    # )
    # wait for that element to load
    wait = WebDriverWait(driver, 10)
    more_button = wait.until(
        EC.presence_of_element_located(
            (
                By.XPATH,
                "//a[@data-automation-id='TeacherStudentList_MoreMenuArea_Button']",
            )
        )
    )
    time.sleep(1)
    more_button.click()

    # Wait until the span with text "Export as CSV" is present
    export_csv_span = wait.until(
        EC.presence_of_element_located((By.XPATH, "//span[text()='Export as CSV']"))
    )

    # Find the parent <a> of the span
    export_csv_button = export_csv_span.find_element(By.XPATH, "./..")

    driver.execute_script("arguments[0].click();", export_csv_button)

    # wait for the file to download
    time.sleep(5)


if __name__ == "__main__":
    get_student_data()
