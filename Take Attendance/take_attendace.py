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
import pandas as pd
import time
import datetime
import os
import numpy as np


# make a tuple for 1st, 2nd, 5th, 6th, and 7th periods
# the first number should be the start time, the 2nd the end time
# time should be in datetime format

first_per = [datetime.time(5), datetime.time(8, 15)]
second_per = [datetime.time(8, 00), datetime.time(9, 15)]
fourth_per = [datetime.time(11, 30), datetime.time(13)]
