const _ = require('lodash');
const csv = require('csv/lib/sync');
const fs = require('fs');
const LZString = require('lz-string');
const nodemailer = require('nodemailer');

//--------------
// Configuration
//--------------
const user = 'AXXXXXXXXXXXXXXXXXXX';
const pass = 'access-key-example';

const isTesting = !!process.env.IS_TESTING;
const smtpHost = 'email-smtp.us-west-2.amazonaws.com';

const smtpPort = 465;
const smtpSecure = true;

async function createTransporter(isTesting=false) {
    const auth = isTesting ? await nodemailer.createTestAccount() : { user, pass };
    const smtpConfig = isTesting
                        ? { auth, host: 'smtp.ethereal.email', port: 587, secure: false }
                        : { auth, host: smtpHost, port: smtpPort, secure: smtpSecure };

    return nodemailer.createTransport(smtpConfig);
}

//-------------
// Send Email
//-------------
//const submissions_2d = require('./submissions/BeautifulRunes');
//const submissions_3d = require('./submissions/3d_contest');
//const submissions_curve = require('./submissions/curve_contest');
//const submissions_sound = require('./submissions/sound_contest');
const submissions_auto = require('./submissions/AutomatonsGotTalent_contest');

const groups = [
    // { name: 'Beautiful Runes', submissions: submissions_2d, fn: 'runes_contest_', url: 'https://forms.gle/xxx' }
    // { name: '3D Runes', submissions: submissions_3d, fn: 'three_d_contest_', url: 'https://goo.gl/forms/xxx' },
    // { name: 'The Choreographer', submissions: submissions_curve, fn: 'curves_contest_', url: 'https://goo.gl/forms/xxx' },
    // { name: 'Game of Tones', submissions: submissions_sound, fn: 'sounds_contest_', url: 'https://goo.gl/forms/xxx' }
    { name: 'Automatons Got Talent', submissions: submissions_auto, fn: 'AutomatonsGotTalent_contest_', url: 'https://forms.gle/xxx' }
];

let throttleIndex = 0;
const student_selections = csv.parse(fs.readFileSync('./students/cs1101s_selections.csv').toString(), { columns: true });
createTransporter()
.then(transporter => {
    student_selections.forEach(student => {
        const recipients = student['Email'];
        const group = groups.filter(group => group.name === student.group)[0];

        const targetIds = student.submissions.split(', ').map(Number);
        const urls = targetIds.map(targetId => group.submissions.find(submission => submission.student.id === targetId)).map(submission => submission.url);
        const redefinedUrls = urls.map((url, i) => {
            const [head, ...tail] = url.split('prgrm=');
            const prgrm = tail.join('prgrm=');
            const searchRegExp = new RegExp(`${group.fn}\[a-zA-Z0-9_]+`, 'g');
            const replaceString = `${group.fn}entry_${i + 1}`;

            const originalPrgrm = LZString.decompressFromEncodedURIComponent(prgrm);

            //const modifiedPrgrm = originalPrgrm.replace(searchRegExp, replaceString);

            //const modifiedPrgrm2 = `${modifiedPrgrm}play(${replaceString}());`;
            //const modifiedPrgrm2 = `${modifiedPrgrm}${replaceString}();`;

            //const redefinedPrgrm = LZString.compressToEncodedURIComponent(modifiedPrgrm);
            const redefinedPrgrm = LZString.compressToEncodedURIComponent(originalPrgrm);

            return `${head}prgrm=${redefinedPrgrm}`;
        });

        const mailOptions = {
            from: 'cs1101s@comp.nus.edu.sg',
            to: recipients,
            cc: 'cs1101s@comp.nus.edu.sg',
            subject: `Automatons Got Talent`,
            html: `
    Dear CS1101S student,<br/>
    <br/>
    You have been assigned 10 entries of the same contest to rank in order of 1st to 10th!
    Please review these entries by clicking on them. They will open in YouTube.
    <br/>
    Then please click on <a href=${group.url}>&lt;this link&gt;</a> to enter your preferences
    in the order of your preference, from most preferred 1st to least preferred 10th.
    Make sure there is exactly one tick in each row and column. You may need to scroll to see
    the last column.<br/>
    <br/>
    Assigned contest entries:<br/>
    ${redefinedUrls.map((url, i) => `<a href="${encodeURI(url)}">Entry ${i + 1}</a>&nbsp;&nbsp;`).join('<br/>')}<br/>
    <br/>
    You may need to refresh your browser to activate the contest library in the playground.
    In Chrome: History &gt; Show Full History &gt; Clear browsing data<br/>
    <br/>
    For technical issues regarding the voting, please use the piazza folder "contest_voting":
    <a href="https://piazza.com/class/kas136yscf8605">https://piazza.com/class/jg1gbtzfzh816w?cid=527</a><br/>
    <br/>
    <b>Deadline: 30/10/2020, 23:59</b>
    <br/>
    <b>You will be awarded 150 XP for voting.</b><br/>
    <br/>
    Best regards,<br/>
    <br/>
    Your CS1101S Team
    `
        };

        setTimeout(() => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log(info);
            });
        }, throttleIndex * 1000);
        throttleIndex += 1;
    });
});
