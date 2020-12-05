# Contest Emailer

## Developer setup

### System requirements

1. Node.js

### Setting up your local development environment

1. Download contest-emailer files https://github.com/source-academy/scripts

   ```bash
   $ git clone https://github.com/source-academy/scripts
   $ cd scripts/contest-emailer
   $ yarn install
   ```

2. Extract the students data from https://luminus.nus.edu.sg/, then copy the extracted file to  "students/cs1101s_all_students.csv".

3. Extracting student submissions from https://sourceacademy.nus.edu.sg/academy/contests:

   - Open the developer tools network tab and copy the authorization token.
   - Update the accessToken at line number 8 in program_extractor.js with the authorization token.
   - Update the assessmentTitle with the contest name, as well as the extraLibrary.
   - Run program_extractor.js , and copy the result to the contest json file in submissions folder.

4. Run generate_assignment.js to, given all students in the students folder and submissions in the submissions folder, return an assignment of student to contest group + contest submission ids

   - Remove the comment // of the current contest, and comment others.
   - You can find the result of this step at "students/cs1101s_selections.csv"

5. Run assignment_verifier.js to ensure that all submissions have roughly an equal number of voters.

6. Run email_sender.js to, given all assignment in the students folder and submissions in the submissions folder, send email to individual students with their assigned submissions

   - An AWS Access Key ID and AWS Secret Key with SES permission is required.
   - Set the configuration of username and password.
   - Update the email subject and body with the current contest info.

7. Run voting_verifier.js to, given all votes in the voting folder, ensure that no student has engaged in bad voting, and print the most popular and winners of the contests.
