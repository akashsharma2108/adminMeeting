# Application Overview

This application helps manage and schedule Meetings. with investor company and Portfolio Company , here is the guid. how to run and how it works 

## Access Application

### Method 1: Through Link

You can access the application via the following link:

[Meeting Admin pannel](https://)

- Front-end is deployed on Netlify.
- Back-end is deployed on Render.

**Note:** If you encounter no response when accessing the application via the link, please wait for 2 minutes. The backend might be inactive due to the free tier of Render. It will restart within 2 minutes.

### Method 2: Setup Locally

Follow these steps to set up the application locally:


 Clone the repository: git clone https://github.com/akashsharma2108/markDown-viewer.git
 Running Backend: <br/>
    - cd Backend <br/>
    - npm install <br/>

Setup your postgre database and create a .env file in backend file all the details 

DB_USER='postgres'
DB_PASSWORD='admin'
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME='admindatabase'
CORS_ORIGIN='http://localhost:5173'

-npm run dev 

#### two way of accessing apis 
 postman -> https://http://localhost:4000/api/
 [Swagger](https://) 
 in swagger select the local server and use it.


 Frontend: <br/>
    - cd Frontend <br/>
    - npm install <br/>
    - npm run dev  <br/>

Front should be live at https://http://localhost:5173

The application will be up and running with both frontend and backend.


## How it works - Investor->Portfolio Company->Availability Slot-> Selection ->Meeting Schedule->Unscheduled Meetings

### 1. Investor
**Purpose:** Add, view, edit, and delete Investor details.

**Steps:**
1. Navigate to the Investor tab.
2. Click the ADD button.
3. Choose to upload data via CSV or enter it manually.
   - A CSV file for Investors should follow the required format.
   - [examplecsv](https://drive.google.com/file/d/1vvCYWzN437lIKv4OBQYgr0yDt3Wno7xS/view?usp=sharing)
4. After adding data, hit SUBMIT.
5. The application will automatically fetch and display all Investor details.
6. Use the EDIT and DELETE buttons to update or remove data.

### 2. Portfolio Company
**Purpose:** Manage Portfolio Company details.

**Steps:**
1. Navigate to the Portfolio Company tab.
3. Choose to upload data via CSV or enter it manually.
   - A CSV file for Portfolio should follow the required format.
   - [examplecsv](https://drive.google.com/file/d/1THU8ARU64A0H6NhEcxd1lZSWOpJGiEOx/view?usp=sharing)
4. After adding data, hit SUBMIT.
5. The application will automatically fetch and display all Investor details.
6. Use the EDIT and DELETE buttons to update or remove data.

### 3. Availability Slot
**Purpose:** Define availability slots for meetings.

**Steps:**
1. Navigate to the Availability Slot tab.
2. Add data through:
   - CSV Upload
   - A CSV file for Availability should follow the required format.
   - [examplecsv](https://drive.google.com/file/d/1oQKtAbcB4h27C-dRPaOz3vTozl7Prgvx/view?usp=sharing)
   - Manual Input:
     - Select the time zone, date, start time, and end time.
     - Ensure the date range is between 1st Feb and 5th Feb.
3. Click SUBMIT to save the availability slots.

### 4. Selection
**Purpose:** Match Investors with Portfolio Companies.

**Steps:**
1. Navigate to the Selection tab.
2. The tab initially displays an empty selection list.
3. Options:
   - Generate Automatically: Click the GENERATE Selection button to create automatic pairings.
   - Manual Selection: Click ADD Selection to create pairs manually.

### 5. Meeting Schedule
**Purpose:** Schedule meetings based on the generated selections.
**Steps:**
1. Navigate to the Meetings tab.
2. Click the GENERATE MEETING button to create meeting schedules.
3. Features:
   - Download CSV: Download the schedule in CSV format.
   - Update Meetings:
     - Select the SELECTION ID (Investor-Portfolio pair).
     - Ensure the updated timing does not conflict with other meetings; otherwise, an error will occur.

### 6. Unscheduled Meetings
**Purpose:** View and resolve conflicts in meeting schedules.

**Steps:**
1. Navigate to the Unscheduled Meetings tab.
2. Conflicted meetings will be listed here.
3. To resolve conflicts, add a NEW SLOT in the Availability Slot tab.

##### Note:
   - If any updates are made to Investor, Portfolio Company, or Availability Slot, you must revisit the Selection tab and click GENERATE Selection again.

## Summary of Key Actions
- Always ensure CSV files follow the required format for each section.
- Regularly update the Selection tab after modifying related data.
- Avoid scheduling conflicts while updating meetings.
- Use the Unscheduled Meetings tab to track and resolve conflicts.

## Notes
- Ensure proper date and time validations while entering Availability Slots.
- Use the application in a sequential flow: Investor → Portfolio Company → Availability Slot → Selection → Meetings → Unscheduled Meetings.
- Follow the outlined steps to minimize errors and maintain consistency.

## feel free to reach out to me for any queries or suggestions.
### mail: akashsharma90099@gmail.com
#### thank you for visiting my repository.