require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');
const fs = require('fs');
const Stream = require('stream');
const ExcelJS = require('exceljs/dist/es5');
const Sequelize = require('sequelize');
const sequelize = require('../config/dbconfig');
const h1B_DATA_new = require('../models/sqlpractice');
const Employer_Names = require('../models/employer_name');
const exp = require('constants');
const { _ } = require('core-js');
let filesExecuted = 1;
let filePath = './public/excel/LCA_Disclosure_Data_FY2021_Q1.xlsx';

async function initializeImport (req, res, next) {
    if (res) res.render('index', { status: 'Started' });

    const columns = ["CASE_NUMBER","CASE_STATUS","RECEIVED_DATE","DECISION_DATE","ORIGINAL_CERT_DATE","VISA_CLASS","JOB_TITLE","SOC_CODE","SOC_TITLE","FULL_TIME_POSITION","BEGIN_DATE","END_DATE","TOTAL_WORKER_POSITIONS","NEW_EMPLOYMENT","CONTINUED_EMPLOYMENT","CHANGE_PREVIOUS_EMPLOYMENT","NEW_CONCURRENT_EMPLOYMENT","CHANGE_EMPLOYER","AMENDED_PETITION","EMPLOYER_NAME","TRADE_NAME_DBA","EMPLOYER_ADDRESS1","EMPLOYER_ADDRESS2","EMPLOYER_CITY","EMPLOYER_STATE","EMPLOYER_POSTAL_CODE","EMPLOYER_COUNTRY","EMPLOYER_PROVINCE","EMPLOYER_PHONE","EMPLOYER_PHONE_EXT","NAICS_CODE","EMPLOYER_POC_LAST_NAME","EMPLOYER_POC_FIRST_NAME","EMPLOYER_POC_MIDDLE_NAME","EMPLOYER_POC_JOB_TITLE","EMPLOYER_POC_ADDRESS_1","EMPLOYER_POC_ADDRESS_2","EMPLOYER_POC_CITY","EMPLOYER_POC_STATE","EMPLOYER_POC_POSTAL_CODE","EMPLOYER_POC_COUNTRY","EMPLOYER_POC_PROVINCE","EMPLOYER_POC_PHONE","EMPLOYER_POC_PHONE_EXT","EMPLOYER_POC_EMAIL","AGENT_REPRESENTING_EMPLOYER","AGENT_ATTORNEY_LAST_NAME","AGENT_ATTORNEY_FIRST_NAME","AGENT_ATTORNEY_MIDDLE_NAME","AGENT_ATTORNEY_ADDRESS1","AGENT_ATTORNEY_ADDRESS2","AGENT_ATTORNEY_CITY","AGENT_ATTORNEY_STATE","AGENT_ATTORNEY_POSTAL_CODE","AGENT_ATTORNEY_COUNTRY","AGENT_ATTORNEY_PROVINCE","AGENT_ATTORNEY_PHONE","AGENT_ATTORNEY_PHONE_EXT","AGENT_ATTORNEY_EMAIL_ADDRESS","LAWFIRM_NAME_BUSINESS_NAME","STATE_OF_HIGHEST_COURT","NAME_OF_HIGHEST_STATE_COURT","WORKSITE_WORKERS","SECONDARY_ENTITY","SECONDARY_ENTITY_BUSINESS_NAME","WORKSITE_ADDRESS1","WORKSITE_ADDRESS2","WORKSITE_CITY","WORKSITE_COUNTY","WORKSITE_STATE","WORKSITE_POSTAL_CODE","WAGE_RATE_OF_PAY_FROM","WAGE_RATE_OF_PAY_TO","WAGE_UNIT_OF_PAY","PREVAILING_WAGE","PW_UNIT_OF_PAY","PW_TRACKING_NUMBER","PW_WAGE_LEVEL","PW_OES_YEAR","PW_OTHER_SOURCE","PW_OTHER_YEAR","PW_SURVEY_PUBLISHER","PW_SURVEY_NAME","TOTAL_WORKSITE_LOCATIONS","AGREE_TO_LC_STATEMENT","H1B_DEPENDENT","WILLFUL_VIOLATOR","SUPPORT_H1B","STATUTORY_BASIS","APPENDIX_A_ATTACHED","PUBLIC_DISCLOSURE","PREPARER_LAST_NAME","PREPARER_FIRST_NAME","PREPARER_MIDDLE_INITIAL","PREPARER_BUSINESS_NAME","PREPARER_EMAIL"];
    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
    let allRows = {};
    const allnames = await getAllEmployers();
    let allCompanies = allnames.map(name=>name.Employer_Name);
    let newCompanies = [];
    let allStates = {
        twoLetter: ["AL","AK","AS","AZ","AR","CA","CO","CT","DE","DC","FL","GA","GU","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","MP","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VT","VA","VI","WA","WV","WI","WY"],
        abbreviations: ["ALABAMA","ALASKA","AMERICAN SAMOA","ARIZONA","ARKANSAS","CALIFORNIA","COLORADO","CONNECTICUT","DELAWARE","DISTRICT OF COLUMBIA","FLORIDA","GEORGIA","GUAM","HAWAII","IDAHO","ILLINOIS","INDIANA","IOWA","KANSAS","KENTUCKY","LOUISIANA","MAINE","MARYLAND","MASSACHUSETTS","MICHIGAN","MINNESOTA","MISSISSIPPI","MISSOURI","MONTANA","NEBRASKA","NEVADA","NEW HAMPSHIRE","NEW JERSEY","NEW MEXICO","NEW YORK","NORTH CAROLINA","NORTH DAKOTA","NORTHERN MARIANA IS","OHIO","OKLAHOMA","OREGON","PENNSYLVANIA","PUERTO RICO","RHODE ISLAND","SOUTH CAROLINA","SOUTH DAKOTA","TENNESSEE","TEXAS","UTAH","VERMONT","VIRGINIA","VIRGIN ISLANDS","WASHINGTON","WEST VIRGINIA","WISCONSIN","WYOMING"]
    };
    let statesMismatch = [];
    let largeColumns = ['PREPARER_BUSINESS_NAME','LAWFIRM_NAME_BUSINESS_NAME','EMPLOYER_POC_JOB_TITLE','SOC_TITLE','JOB_TITLE','EMPLOYER_NAME','PW_SURVEY_NAME','WORKSITE_ADDRESS1','EMPLOYER_ADDRESS2','EMPLOYER_POC_ADDRESS_2','EMPLOYER_ADDRESS1','PW_SURVEY_PUBLISHER','EMPLOYER_POC_ADDRESS_1','EMPLOYER_POC_EMAIL','NAME_OF_HIGHEST_STATE_COURT','TRADE_NAME_DBA','AGENT_ATTORNEY_EMAIL_ADDRESS','WORKSITE_ADDRESS2','AGENT_ATTORNEY_ADDRESS2','AGENT_ATTORNEY_ADDRESS1'];
    let muchLarger = ['SECONDARY_ENTITY_BUSINESS_NAME'];
    let issueCaseNumber = [];
    const otherWageTypes = ['Hour', 'Bi-Weekly', 'Week', 'Month'];

    let rowIteration = 0;
    let completedRows = [];
    let rowcount = 1;
    let rowNumber = 1
    
    for await (const worksheetReader of workbook) {
        for await (const row of worksheetReader) {
            // let worksheet = workbook.worksheets[0];
            // const rowTotalCount = worksheet.rowCount;
            //worksheet.eachRow({includeEmpty: true}, async (row, rowNumber) => {
            if (rowNumber > 1) {
                let values = row.values;
                values.shift();
                
                let thisRow = {};
                if ((rowcount % 1000) === 1) {
                    rowIteration++;
                    allRows[rowIteration] = [];
                }
                console.log('entering loop: ' + rowNumber);
                for (let i = 0; i < values.length; i++) {
                    let thisVal = values[i] || null;
                    if (typeof thisVal === 'object' && thisVal) thisVal = thisVal.result ? thisVal.result : null;
                    // ignoring first index as its null in every row.
                    if (thisVal && typeof thisVal == 'string' && thisVal.length >= 50 && thisVal.length < 100 && largeColumns.indexOf(columns[i]) === -1 && muchLarger.indexOf(columns[i]) === -1) {
                        largeColumns.push(columns[i]);
                        issueCaseNumber.push({
                            columns: columns[i],
                            caseNumber: values[0],
                            size: thisVal.length
                        })
                    }
                    if (thisVal && typeof thisVal == 'string' && thisVal.length >= 100 && muchLarger.indexOf(columns[i]) === -1) {
                        muchLarger.push(columns[i]);
                        issueCaseNumber.push({
                            columns: columns[i],
                            caseNumber: values[0],
                            size: thisVal.length
                        })
                    }
                    if (columns[i] === 'EMPLOYER_STATE') {
                        // Clean states
                        if (thisVal && allStates.twoLetter.indexOf(thisVal) === -1) {
                            const stateInx = allStates.abbreviations.indexOf(thisVal);
                            if (stateInx != -1) thisVal = allStates.twoLetter[stateInx];
                            else statesMismatch.push(rowNumber);
                        }
                    }
                    if (thisVal && typeof thisVal === 'number') thisVal = thisVal.toString();
                    try {
                        if (columns[i] === 'EMPLOYER_NAME') {
                            // clean employer name
                            let cleanEmployerName = thisVal ? thisVal.trim().toLowerCase() : '';
                            // removing spl characters like , . - _
                            cleanEmployerName = cleanEmployerName.replace(/[^a-zA-Z0-9\s]/g, '');
                            cleanEmployerName = cleanEmployerName.replace(/(inc|limited|private limited|incorporated|llc|llp|l.l.p|lp|l.p|corp|corporation|pvt|dba|&|co)/g, '').replace(/\s{2,}/g,' ').trim().toUpperCase();
                            const companyInx = allCompanies.indexOf(cleanEmployerName);
                            const newCompInx = newCompanies.indexOf(cleanEmployerName);
                            if (companyInx === -1 && newCompInx === -1) {
                                newCompanies.push(cleanEmployerName);
                                thisVal = (allCompanies.length+newCompanies.length).toString();
                            } else {
                                thisVal = ((companyInx != -1 ? companyInx : newCompInx) + 1).toString();
                            }
                        }
                    } catch (error) {
                        console.log('employer name error: ' + error);
                    }
                    // Calculating wage rate
                    if (thisVal && columns[i] === 'WAGE_RATE_OF_PAY_FROM' && values[i+2] === 'Hour') {
                        thisVal = Math.floor(thisVal * 2080).toString();
                    } else if (thisVal && columns[i] === 'WAGE_RATE_OF_PAY_FROM' && values[i+2] === 'Bi-Weekly') {
                        thisVal = Math.floor(thisVal * 26).toString();
                    } else if (thisVal && columns[i] === 'WAGE_RATE_OF_PAY_FROM' && values[i+2] === 'Week') {
                        thisVal = Math.floor(thisVal * 52).toString();
                    } else if (thisVal && columns[i] === 'WAGE_RATE_OF_PAY_FROM' && values[i+2] === 'Month') {
                        thisVal = Math.floor(thisVal * 12).toString();
                    }

                    if (columns[i] === 'WAGE_UNIT_OF_PAY' && otherWageTypes.indexOf(thisVal) !== -1) {
                        thisVal = 'Year';
                    }
                    thisRow[columns[i]] = thisVal;
                }
                allRows[rowIteration].push(thisRow);
                rowcount++;
            };
                
            //});
            rowNumber++;
        }
    }
    const rowObjects = Object.keys(allRows);
    for (let i = 0; i < rowObjects.length; i++) {
        console.log(`row insert: ${rowObjects[i]}`)
        try {
            await insertCase(allRows[rowObjects[i]], rowObjects[i]);
        } catch (err) {
            console.log(err)
        }
        completedRows.push(rowObjects[i]);
    }
    
    let constructCompanyobj = [];
    for (let i = 0; i < newCompanies.length; i++) {
        const company = newCompanies[i];
        constructCompanyobj.push({
            ID: i+1,
            Employer_Name: company
        })
    }
    try {
        await insertEmployerName(constructCompanyobj);
    } catch (err) {
        console.log(err)
    }
    console.log('--------- end -------------');
    try {
        fs.appendFile("log.txt", `\nFile saved ${filePath}\nlarger: ${largeColumns.join(', ')}\n much larger: ${muchLarger.join(', ')}\n caseNumbers: ${JSON.stringify(issueCaseNumber)}\n`, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    } catch (erFile) {
        console.log('errore while writing', erFile);
        
    }
    if (filesExecuted < 4) executeAllFiles();
    // workbook.xlsx.read(stream).then (async () => {
    
        
    // }, error=>{
    //    console.log ('-- fetching', error);
    // });
    
}

async function insertEmploye () {
    await insertEmployerName([{ID: 1,Employer_Name: 'HEXAWARE TECHNOLOGIES'},
    {ID: 2,Employer_Name: 'WIPRO'},
    {ID: 3,Employer_Name: 'MASTECH DIGITAL INFOTECH'},
    {ID: 4,Employer_Name: 'VIRTUSA ORATION'},
    {ID: 5,Employer_Name: 'XTGLOBAL'},
    {ID: 6,Employer_Name: 'SUN CLOUD'},
    {ID: 7,Employer_Name: 'FACEBOOK'},
    {ID: 8,Employer_Name: 'GNIZANT TECHNOLOGY SOLUTIONS US'},
    {ID: 9,Employer_Name: 'INFOSYS'},
    {ID: 10,Employer_Name: 'EBAY'},
    {ID: 11,Employer_Name: 'CAPGEMINI AMERICA'},
    {ID: 12,Employer_Name: 'VIZPLUM ORATION'},
    {ID: 13,Employer_Name: 'SYSTEM SOFT TECHNOLOGIES'},
    {ID: 14,Employer_Name: 'TATA NSULTANCY SERVICES'},
    {ID: 15,Employer_Name: 'XENONINFOTEK'},
    {ID: 16,Employer_Name: 'IT HUB'},
    {ID: 17,Employer_Name: 'PROKARMA'},
    {ID: 18,Employer_Name: 'MPUBAHN'},
    {ID: 19,Employer_Name: 'NVIDIA ORATION'},
    {ID: 20,Employer_Name: 'NAZTEC INTERNATIONAL GROUP'},
    {ID: 21,Employer_Name: 'SAVI TECHNOLOGIES'},
    {ID: 22,Employer_Name: 'DATAEDGE NSULTING'},
    {ID: 23,Employer_Name: 'BIGDATA DIMENSION'},
    {ID: 24,Employer_Name: 'SOLIZE USA ORATION'},
    {ID: 25,Employer_Name: 'PRIMUS GLOBAL SERVICES'},
    {ID: 26,Employer_Name: 'RICEFW TECHNOLOGIES'},
    {ID: 27,Employer_Name: 'MIRACLE SOFTWARE SYSTEMS'},
    {ID: 28,Employer_Name: 'QUEST GLOBAL SERVICES NA'},
    {ID: 29,Employer_Name: 'GLOBALGATE IT SOLUTIONS'},
    {ID: 30,Employer_Name: 'PIORION SOLUTIONS'},
    {ID: 31,Employer_Name: 'ORATE MPUTER SERVICES'},
    {ID: 32,Employer_Name: 'TECHNOCRATIC'},
    {ID: 33,Employer_Name: 'INFOSMART TECHNOLOGIES'},
    {ID: 34,Employer_Name: 'ITC INFOTECH USA'},
    {ID: 35,Employer_Name: 'EXEVNSULTING'},
    {ID: 36,Employer_Name: 'MINDTREE'},
    {ID: 37,Employer_Name: 'IT TRAILBLAZERS'},
    {ID: 38,Employer_Name: 'NESS USA'},
    {ID: 39,Employer_Name: 'CAT TECHNOLOGY'},
    {ID: 40,Employer_Name: 'VASTIKA'},
    {ID: 41,Employer_Name: 'SAAMA TECHNOLOGIES'},
    {ID: 42,Employer_Name: 'PERK SYSTEMS'},
    {ID: 43,Employer_Name: 'SUPRASOFT'},
    {ID: 44,Employer_Name: 'VALUEMOMENTUM'},
    {ID: 45,Employer_Name: 'MITCHELLMARTIN'},
    {ID: 46,Employer_Name: 'MAVENIR SYSTEMS'},
    {ID: 47,Employer_Name: 'JNIT TECHNOLOGIES'},
    {ID: 48,Employer_Name: 'WHI SOLUTIONS'},
    {ID: 49,Employer_Name: 'HCL AMERICA'},
    {ID: 50,Employer_Name: 'SYNECHRON'},
    {ID: 51,Employer_Name: 'SOFTWORLD TECHNOLOGIES'},
    {ID: 52,Employer_Name: 'UST GLOBAL'},
    {ID: 53,Employer_Name: 'ACROSS BORDERS MANAGEMENT NSULTING GROUP'},
    {ID: 54,Employer_Name: 'CEDENT NSULTING'},
    {ID: 55,Employer_Name: 'RE ITS LIABILITY MPANY'},
    {ID: 56,Employer_Name: 'ALLIED INFORMATICS'},
    {ID: 57,Employer_Name: 'NVENE'},
    {ID: 58,Employer_Name: 'GLOBAL SOFT TECHNOLOGIES'},
    {ID: 59,Employer_Name: 'STAIDLOGIC'},
    {ID: 60,Employer_Name: 'EPATHUSA'},
    {ID: 61,Employer_Name: 'TERRA INFORMATION GROUP'},
    {ID: 62,Employer_Name: 'EKIN SOLUTIONS'},
    {ID: 63,Employer_Name: 'MASTECH DIGITAL TECHNOLOGIES'},
    {ID: 64,Employer_Name: 'TECH MAHINDRA AMERICAS'},
    {ID: 65,Employer_Name: 'CLOUD EPA'},
    {ID: 66,Employer_Name: 'MPUNNEL SOFTWARE GROUP'},
    {ID: 67,Employer_Name: 'NUMENTICA'},
    {ID: 68,Employer_Name: 'DIVERSANT'},
    {ID: 69,Employer_Name: 'EVRY USA ORATION'},
    {ID: 70,Employer_Name: 'SRI TECH SOLUTIONS'},
    {ID: 71,Employer_Name: 'LARSEN TOUBRO INFOTECH'},
    {ID: 72,Employer_Name: 'TECH TAMMINA'},
    {ID: 73,Employer_Name: 'APEX TECHNOLOGY GROUP'},
    {ID: 74,Employer_Name: 'TECHMILEAGE SOFTWARE SOLUTIONS'},
    {ID: 75,Employer_Name: 'BELL INFO SOLUTIONS'},
    {ID: 76,Employer_Name: 'INSPIRA'},
    {ID: 77,Employer_Name: 'MANHATTAN ASSOCIATES'},
    {ID: 78,Employer_Name: 'CIRQUETECH GROUP'},
    {ID: 79,Employer_Name: 'DEEBEN'},
    {ID: 80,Employer_Name: 'ENQUERO'},
    {ID: 81,Employer_Name: 'ALTEK'},
    {ID: 82,Employer_Name: '8K MILES HEALTH CLOUD'},
    {ID: 83,Employer_Name: 'HERMES NETWORK'},
    {ID: 84,Employer_Name: 'SASKEN TECHNOLOGIES'},
    {ID: 85,Employer_Name: 'DETROIT ENGINEERED PRODUCTS'},
    {ID: 86,Employer_Name: 'BYTEWARE'},
    {ID: 87,Employer_Name: 'FIRST SOFT SOLUTIONS'},
    {ID: 88,Employer_Name: 'MAXIMA NSULTING'},
    {ID: 89,Employer_Name: 'SYSTEMS TECHNOLOGY GROUP'},
    {ID: 90,Employer_Name: 'UNIQUE KEY RESOURCES'},
    {ID: 91,Employer_Name: 'NTINENTAL TECHNOLOGY SOLUTIONS'},
    {ID: 92,Employer_Name: 'STELLAR IT SOLUTIONS'},
    {ID: 93,Employer_Name: 'AHA NET NSULTING'},
    {ID: 94,Employer_Name: 'VIRTUSA NSULTING SERVICES LTD'},
    {ID: 95,Employer_Name: 'HCL GLOBAL SYSTEMS'},
    {ID: 96,Employer_Name: 'REI SYSTEMS'},
    {ID: 97,Employer_Name: 'I3GLOBALTECH'},
    {ID: 98,Employer_Name: 'PRITNA'},
    {ID: 99,Employer_Name: 'EPITEC'},
    {ID: 100,Employer_Name: 'SMART SOURCE TECHNOLOGIES'},
    {ID: 101,Employer_Name: 'DATARE SYSTEMS'},
    {ID: 102,Employer_Name: 'IQ SPECTRA'},
    {ID: 103,Employer_Name: 'TECHVISION'},
    {ID: 104,Employer_Name: 'NORTHSTAR GROUP'},
    {ID: 105,Employer_Name: 'VENTURESOFT GLOBAL'},
    {ID: 106,Employer_Name: 'SRIVIN INFOSYSTEMS'},
    {ID: 107,Employer_Name: 'ERPMARK'},
    {ID: 108,Employer_Name: 'SYRAINFOTEK'},
    {ID: 109,Employer_Name: 'SLK AMERICA'},
    {ID: 110,Employer_Name: 'LEAD IT ORATION'},
    {ID: 111,Employer_Name: 'INDUS USA'},
    {ID: 112,Employer_Name: 'CEREBRAL TECHNOLOGIES'},
    {ID: 113,Employer_Name: 'SOHANIT'},
    {ID: 114,Employer_Name: 'UNITED SOFTWARE GROUP'},
    {ID: 115,Employer_Name: 'NEXUS IT'},
    {ID: 116,Employer_Name: 'VIRTUE GROUP'},
    {ID: 117,Employer_Name: 'CITIUSTECH'},
    {ID: 118,Employer_Name: 'HINDUJA TECH'},
    {ID: 119,Employer_Name: 'BIRLASOFT'},
    {ID: 120,Employer_Name: 'ETOUCH SYSTEMS ORATION'},
    {ID: 121,Employer_Name: 'SOFT LABSNA'},
    {ID: 122,Employer_Name: 'ATOS SYNTEL'},
    {ID: 123,Employer_Name: 'SARIAN SOLUTIONS'},
    {ID: 124,Employer_Name: 'DECHEN NSULTING GROUP'},
    {ID: 125,Employer_Name: 'CIGNITI TECHNOLOGIES'},
    {ID: 126,Employer_Name: 'GNIER'},
    {ID: 127,Employer_Name: 'QUALMM TECHNOLOGIES'},
    {ID: 128,Employer_Name: 'MSRSMOS'},
    {ID: 129,Employer_Name: 'PDDN'},
    {ID: 130,Employer_Name: 'KENSINGTON INFORMATION GROUP'},
    {ID: 131,Employer_Name: 'SAPPHIRE SOFTWARE SOLUTIONS'},
    {ID: 132,Employer_Name: 'SCHRILL TECHNOLOGIES'},
    {ID: 133,Employer_Name: 'O2 TECHNOLOGIES'},
    {ID: 134,Employer_Name: 'HUGHES NETWORK SYSTEMS'},
    {ID: 135,Employer_Name: 'INSOFT'},
    {ID: 136,Employer_Name: 'SUNRAISE TECHNOLOGIES'},
    {ID: 137,Employer_Name: 'SLYON TECHNOLOGIES'},
    {ID: 138,Employer_Name: 'AXIS TECH'},
    {ID: 139,Employer_Name: 'GENISIS TECHNOLOGY SOLUTIONS'},
    {ID: 140,Employer_Name: 'SR INTERNATIONAL'},
    {ID: 141,Employer_Name: 'SOURCEINFO TECH'},
    {ID: 142,Employer_Name: 'LUSSOTECH'},
    {ID: 143,Employer_Name: 'STANSOURCE'},
    {ID: 144,Employer_Name: 'SBP NSULTING'},
    {ID: 145,Employer_Name: 'DYNAMIC ITSOLUTIONS'},
    {ID: 146,Employer_Name: 'FLEXASOFT'},
    {ID: 147,Employer_Name: 'FUSION GLOBAL SOLUTIONS'},
    {ID: 148,Employer_Name: 'IMCS GROUP'},
    {ID: 149,Employer_Name: 'VLINK'},
    {ID: 150,Employer_Name: 'PRISTINE REHAB CARE'},
    {ID: 151,Employer_Name: 'PROMANTUS'},
    {ID: 152,Employer_Name: 'INFOSOFT'},
    {ID: 153,Employer_Name: 'TRISYNC TECHNOLOGIES'},
    {ID: 154,Employer_Name: 'HORIZON SOFTECH'},
    {ID: 155,Employer_Name: 'UNIN PHARMA'},
    {ID: 156,Employer_Name: 'DE ACE SOLUTIONS'},
    {ID: 157,Employer_Name: 'FEDERAL SOFT SYSTEMS'},
    {ID: 158,Employer_Name: 'VERANS BUSINESS SOLUTIONS'},
    {ID: 159,Employer_Name: 'NATSOFT ORATION'},
    {ID: 160,Employer_Name: 'APPRIDAT SOLUTIONS'},
    {ID: 161,Employer_Name: 'INDOTRONIX INTERNATIONAL ORATION'},
    {ID: 162,Employer_Name: 'THE MATHWORKS'},
    {ID: 163,Employer_Name: 'PERFICIENT'},
    {ID: 164,Employer_Name: 'CARDUS'},
    {ID: 165,Employer_Name: 'REALSOFT TECHNOLOGIES'},
    {ID: 166,Employer_Name: 'VINGS TECHNOLOGIES'},
    {ID: 167,Employer_Name: 'INFOMERICA'},
    {ID: 168,Employer_Name: 'FUSION LIFE SCIENCES TECHNOLOGIES'},
    {ID: 169,Employer_Name: 'SONSOFT'},
    {ID: 170,Employer_Name: 'CAREER SOFT SOLUTIONS'},
    {ID: 171,Employer_Name: 'SPRY INFO SOLUTIONS'},
    {ID: 172,Employer_Name: 'PERITUS'},
    {ID: 173,Employer_Name: 'URL SYSTEMS'},
    {ID: 174,Employer_Name: 'STRATEGIC RESOURCES INTERNATIONAL'},
    {ID: 175,Employer_Name: 'TECHNOLOGY HUB'},
    {ID: 176,Employer_Name: 'SERVESYS ORATION'},
    {ID: 177,Employer_Name: 'MAXARY'},
    {ID: 178,Employer_Name: 'METANOIA SOLUTIONS'},
    {ID: 179,Employer_Name: 'LOGIC PLANET'},
    {ID: 180,Employer_Name: 'TECHPILLARS'},
    {ID: 181,Employer_Name: 'PROSOFT TECHNOLOGY GROUP'},
    {ID: 182,Employer_Name: 'EXA DATA SOLUTIONS'},
    {ID: 183,Employer_Name: 'INFINITE MPUTER SOLUTIONS'},
    {ID: 184,Employer_Name: 'GLOBALLOGIC'},
    {ID: 185,Employer_Name: 'SSA TECH'},
    {ID: 186,Employer_Name: 'JDC HEALTHCARE P'},
    {ID: 187,Employer_Name: 'RIDECELL'},
    {ID: 188,Employer_Name: 'DOTS TECHNOLOGIES'},
    {ID: 189,Employer_Name: 'STECK SYSTEMS'},
    {ID: 190,Employer_Name: 'CLIENTSERVER TECHNOLOGY SOLUTIONS'},
    {ID: 191,Employer_Name: 'ABAL TECHNOLOGIES'},
    {ID: 192,Employer_Name: 'ADORESOFT ORATION'},
    {ID: 193,Employer_Name: 'ALTAIR PRODUCTDESIGN'},
    {ID: 194,Employer_Name: 'CAPSQUARE SYSTEMS'},
    {ID: 195,Employer_Name: 'SHINEWELL TECHNOLOGIES'},
    {ID: 196,Employer_Name: 'SUNRISE INFOTEK'},
    {ID: 197,Employer_Name: 'PRIME NSULTING'},
    {ID: 198,Employer_Name: 'BI LABS'},
    {ID: 199,Employer_Name: 'MYTHRI NSULTING'},
    {ID: 200,Employer_Name: 'TEKREANT'},
    {ID: 201,Employer_Name: 'FIRST NSULTING GROUP'},
    {ID: 202,Employer_Name: 'SICL AMERICA'},
    {ID: 203,Employer_Name: 'METRIX IT SOLUTIONS'},
    {ID: 204,Employer_Name: 'LORHAN ORATION'},
    {ID: 205,Employer_Name: 'EDO'},
    {ID: 206,Employer_Name: 'PVR TECHNOLOGIES'},
    {ID: 207,Employer_Name: 'FARADAY FUTURE'},
    {ID: 208,Employer_Name: 'NUMERO DATA'},
    {ID: 209,Employer_Name: 'UNITED PHARMA TECHNOLOGIES'},
    {ID: 210,Employer_Name: 'VINTECH SOLUTIONS'},
    {ID: 211,Employer_Name: 'IRIS SOFTWARE'},
    {ID: 212,Employer_Name: 'AV NSULTING'},
    {ID: 213,Employer_Name: 'DELOITTE NSULTING'},
    {ID: 214,Employer_Name: 'ACLARA SMART GRID SOLUTIONS'},
    {ID: 215,Employer_Name: 'DISH NETWORK'},
    {ID: 216,Employer_Name: 'BLAZE MAKOID ARCHITECTURE P'},
    {ID: 217,Employer_Name: 'WELLINGTON MANAGEMENT MPANY'},
    {ID: 218,Employer_Name: 'OSF MULTISPECIALTY GROUP'},
    {ID: 219,Employer_Name: 'CHEN TECH'},
    {ID: 220,Employer_Name: 'FILTERED'},
    {ID: 221,Employer_Name: 'RUTGERSTHE STATE UNIVERSITY OF NEW JERSEY'},
    {ID: 222,Employer_Name: 'BLUESHIFT LABS'},
    {ID: 223,Employer_Name: 'NTT DATA'},
    {ID: 224,Employer_Name: 'PRICEWATERHOUSEOPERS'},
    {ID: 225,Employer_Name: 'AMERICAN AIRLINES'},
    {ID: 226,Employer_Name: 'APPZEN'},
    {ID: 227,Employer_Name: 'ASTRAZENECA PHARMACEUTICALS'},
    {ID: 228,Employer_Name: 'UNIVERSITY OF WASHINGTON'},
    {ID: 229,Employer_Name: 'RANDSTAD TECHNOLOGIES'},
    {ID: 230,Employer_Name: 'CAPITAL ONE SERVICES'},
    {ID: 231,Employer_Name: 'KFORCE'},
    {ID: 232,Employer_Name: 'MACYSM'},
    {ID: 233,Employer_Name: 'SKYWORKS SOLUTIONS'},
    {ID: 234,Employer_Name: 'MENTOR GRAPHICS ORATION'},
    {ID: 235,Employer_Name: 'ATIEVA USA'},
    {ID: 236,Employer_Name: 'JPMORGAN CHASE'},
    {ID: 237,Employer_Name: 'REHAB SPECIALISTS CALIFORNIA'},
    {ID: 238,Employer_Name: 'AMAZONM SERVICES'},
    {ID: 239,Employer_Name: 'TEXAS AM UNIVERSITY'},
    {ID: 240,Employer_Name: 'AMERICAN MULTICINEMA'},
    {ID: 241,Employer_Name: 'TRACTOR SUPPLY MPANY'},
    {ID: 242,Employer_Name: 'ACCENTURE'},
    {ID: 243,Employer_Name: 'EMORY UNIVERSITY'},
    {ID: 244,Employer_Name: 'ASIAN MEDIA RIGHTS'},
    {ID: 245,Employer_Name: 'THE BUREAU OF NATIONAL AFFAIRS'},
    {ID: 246,Employer_Name: 'VISI INFOTECH SOLUTIONS'},
    {ID: 247,Employer_Name: 'STOWERS INSTITUTE FOR MEDICAL RESEARCH'},
    {ID: 248,Employer_Name: 'VISA TECHNOLOGY OPERATIONS'},
    {ID: 249,Employer_Name: 'CGI TECHNOLOGIES AND SOLUTIONS'},
    {ID: 250,Employer_Name: 'JOHNSON NTROLS'},
    {ID: 251,Employer_Name: 'INGENI RETAIL ENTERPRISE US'},
    {ID: 252,Employer_Name: 'SHANDS TEACHING HOSPITAL AND CLINICS'},
    {ID: 253,Employer_Name: 'UTBATTELLE OAK RIDGE NATIONAL LABORATORY'},
    {ID: 254,Employer_Name: 'NATIONAL INSTITUTES OF HEALTH HHS'},
    {ID: 255,Employer_Name: 'MICROSOFT ORATION'},
    {ID: 256,Employer_Name: 'UNICAL AVIATION'},
    {ID: 257,Employer_Name: 'MAYO CLINIC'},
    {ID: 258,Employer_Name: 'AMAZON WEB SERVICES'},
    {ID: 259,Employer_Name: 'DEPARTMENT OF VETERANS AFFAIRS'},
    {ID: 260,Employer_Name: 'FIRST DATA ORATION'},
    {ID: 261,Employer_Name: 'MCAST CABLE MMUNICATIONS'},
    {ID: 262,Employer_Name: 'AMERICAN ENTERPRISE INSTITUTE FOR PUBLIC POLICY RESEARCH'},
    {ID: 263,Employer_Name: 'ION MEDIA NETWORKS'},
    {ID: 264,Employer_Name: 'HARVARD UNIVERSITY'},
    {ID: 265,Employer_Name: 'LLABERA'},
    {ID: 266,Employer_Name: 'HEATCRAFT REFRIGERATION PRODUCTS'},
    {ID: 267,Employer_Name: 'GLOBAL IT SOLUTIONS'},
    {ID: 268,Employer_Name: 'SATN'},
    {ID: 269,Employer_Name: 'XRS ORATION'},
    {ID: 270,Employer_Name: 'SHAY TECH'},
    {ID: 271,Employer_Name: 'JABS ENGINEERING GROUP'},
    {ID: 272,Employer_Name: 'ENVIRONMENTAL SYSTEMS RESEARCH INSTITUTE ESRI'},
    {ID: 273,Employer_Name: 'ANTHEM'},
    {ID: 274,Employer_Name: 'ERNST YOUNG US'},
    {ID: 275,Employer_Name: 'BROWN UNIVERSITY'},
    {ID: 276,Employer_Name: '10 BITS'},
    {ID: 277,Employer_Name: 'THORNTON TOMASETTI'},
    {ID: 278,Employer_Name: 'RIVIAN AUTOMOTIVE'},
    {ID: 279,Employer_Name: 'CANCER SPECIALISTS'},
    {ID: 280,Employer_Name: 'ADI WORLDLINK'},
    {ID: 281,Employer_Name: 'BANDAI NAM ENTERTAINMENT AMERICA'},
    {ID: 282,Employer_Name: 'UNIVERSAL CABLE HOLDINGS SUDDENLINK MMUNICATIONS'},
    {ID: 283,Employer_Name: 'RGA ENTERPRISE SERVICES MPANY'},
    {ID: 284,Employer_Name: 'RENDER SERVICES'},
    {ID: 285,Employer_Name: 'AMAZECH SOLUTIONS'},
    {ID: 286,Employer_Name: 'GOOGLE'},
    {ID: 287,Employer_Name: 'LINKEDIN ORATION'},
    {ID: 288,Employer_Name: 'XPO ENTERPRISE SERVICES'},
    {ID: 289,Employer_Name: 'STARBUCKS FFEE MPANY'},
    {ID: 290,Employer_Name: 'NEW YORK AUTO DEPOT'},
    {ID: 291,Employer_Name: 'UNIVERSITY OF MASSACHUSETTS MEDICAL SCHOOL'},
    {ID: 292,Employer_Name: 'JOHNS HOPKINS UNIVERSITY'},
    {ID: 293,Employer_Name: 'MOHAWK INDUSTRIES'},
    {ID: 294,Employer_Name: 'ROKU'},
    {ID: 295,Employer_Name: 'METHODIST HEALTHCARE MEMPHIS HOSPITALS'},
    {ID: 296,Employer_Name: 'ZF PASSIVE SAFETY SYSTEMS US'},
    {ID: 297,Employer_Name: 'DEERE AND MPANY'},
    {ID: 298,Employer_Name: 'WONDERBOTZ'},
    {ID: 299,Employer_Name: 'SAP AMERICA'},
    {ID: 300,Employer_Name: 'THE SPUR GROUP'},
    {ID: 301,Employer_Name: 'SOUTHEASTERN PHYSICIAN SERVICES PC'},
    {ID: 302,Employer_Name: 'VARIYAS GLOBAL SOLUTIONS'},
    {ID: 303,Employer_Name: 'INTUIT'},
    {ID: 304,Employer_Name: 'HINDUJA GLOBAL SOLUTIONS'},
    {ID: 305,Employer_Name: 'TERADATA US'},
    {ID: 306,Employer_Name: 'VISA USA'},
    {ID: 307,Employer_Name: 'VOTPROF'},
    {ID: 308,Employer_Name: 'TAMARACK RANCH'},
    {ID: 309,Employer_Name: '806293501'},
    {ID: 310,Employer_Name: 'SMILISTIC DENTAL'},
    {ID: 311,Employer_Name: 'MERIDIAN CAPITAL GROUP'},
    {ID: 312,Employer_Name: 'NATIONAL BUREAU OF ENOMIC RESEARCH'},
    {ID: 313,Employer_Name: 'NCUR TECHNOLOGIES'},
    {ID: 314,Employer_Name: 'PURVIEW INFOTECH'},
    {ID: 315,Employer_Name: 'SASAKI ASSOCIATES'},
    {ID: 316,Employer_Name: 'TECHMORGONITE SOFTWARE SOLUTIONS'},
    {ID: 317,Employer_Name: 'GRANDISON MANAGEMENT'},
    {ID: 318,Employer_Name: 'AETNA RESOURCES'},
    {ID: 319,Employer_Name: 'KENNEDY KRIEGER INSTITUTE'},
    {ID: 320,Employer_Name: 'FANATICS RETAIL GROUP FULFILLMENT'},
    {ID: 321,Employer_Name: 'NTT DATA SERVICES'},
    {ID: 322,Employer_Name: 'GILEAD SCIENCES'},
    {ID: 323,Employer_Name: 'CITADEL AMERICAS'},
    {ID: 324,Employer_Name: 'LLABORATIVE IMAGING'},
    {ID: 325,Employer_Name: 'MAYER BROWN'},
    {ID: 326,Employer_Name: 'FISHER MPANY'},
    {ID: 327,Employer_Name: 'TALEND'},
    {ID: 328,Employer_Name: 'WILLIAMSSONOMA'},
    {ID: 329,Employer_Name: 'NESTLE USA'},
    {ID: 330,Employer_Name: 'MAXIM INTEGRATED PRODUCTS'},
    {ID: 331,Employer_Name: 'NOMURA HOLDING AMERICA'},
    {ID: 332,Employer_Name: 'SCIENCE APPLICATIONS INTERNATIONAL ORATION'},
    {ID: 333,Employer_Name: 'AUTOMATION ANYWHERE'},
    {ID: 334,Employer_Name: 'REAL EPIC DEVEMENT STUDIOS'},
    {ID: 335,Employer_Name: 'CHINA MED DEVICE'},
    {ID: 336,Employer_Name: 'BARON APP'},
    {ID: 337,Employer_Name: 'CEREBRAS SYSTEMS'},
    {ID: 338,Employer_Name: 'OPTUM SERVICES'},
    {ID: 339,Employer_Name: 'ROBINHOOD MARKETS'},
    {ID: 340,Employer_Name: 'INSURANCE SERVICES OFFICE'},
    {ID: 341,Employer_Name: 'GENERAL MOTORS MPANY'},
    {ID: 342,Employer_Name: 'MEDICAL SCIENCE MPUTING'},
    {ID: 343,Employer_Name: 'RESEARCH FOUNDATION FOR STATE UNIVERSITY OF NEW YORK POLYTECHNIC INSTITUTE'},
    {ID: 344,Employer_Name: 'EPAM SYSTEMS'},
    {ID: 345,Employer_Name: 'BAM BAM KITCHEN'},
    {ID: 346,Employer_Name: 'CSC HOLDINGS'},
    {ID: 347,Employer_Name: 'INNOVATIVE AFTERMARKET GROUP'},
    {ID: 348,Employer_Name: 'NOMURA AMERICA SERVICES'},
    {ID: 349,Employer_Name: 'CITRIX SYSTEMS'},
    {ID: 350,Employer_Name: 'VETS PLUS'},
    {ID: 351,Employer_Name: 'LANGAN ENGINEERING AND ENVIRONMENTAL SERVICES'},
    {ID: 352,Employer_Name: 'OPERVISION'},
    {ID: 353,Employer_Name: 'MIDNTINENT INDEPENDENT SYSTEM OPERATOR'},
    {ID: 354,Employer_Name: 'MELLON INVESTMENTS ORATION'},
    {ID: 355,Employer_Name: 'MARK DAVID LEVINE MD PROFESSIONAL ORATION'},
    {ID: 356,Employer_Name: 'PROSKAUER ROSE'},
    {ID: 357,Employer_Name: 'HERENT'},
    {ID: 358,Employer_Name: 'GENENTECH'},
    {ID: 359,Employer_Name: 'REPUBLIC SERVICES'},
    {ID: 360,Employer_Name: 'INTRALINKS'},
    {ID: 361,Employer_Name: 'INTERPLEX SUNBELT'},
    {ID: 362,Employer_Name: 'EXEIRE'},
    {ID: 363,Employer_Name: 'DIRECT SCAFFOLD SUPPLY'},
    {ID: 364,Employer_Name: 'PERFAWARE'},
    {ID: 365,Employer_Name: 'APPLE'},
    {ID: 366,Employer_Name: 'TARGET ENTERPRISE'},
    {ID: 367,Employer_Name: 'NEXTBITS'},
    {ID: 368,Employer_Name: 'SYNGENTA CROP PROTECTION'},
    {ID: 369,Employer_Name: 'PIX4D'},
    {ID: 370,Employer_Name: 'DUCK CREEK TECHNOLOGIES'},
    {ID: 371,Employer_Name: 'INFORMATICA'},
    {ID: 372,Employer_Name: 'NDUENT STATE HEALTHCARE'},
    {ID: 373,Employer_Name: 'INTERNATIONAL BUSINESS MACHINES ORATION'},
    {ID: 374,Employer_Name: 'JUUL LABS'},
    {ID: 375,Employer_Name: 'CLOUDYWING TECHNOLOGIES'},
    {ID: 376,Employer_Name: 'OREGON STATE UNIVERSITY'},
    {ID: 377,Employer_Name: 'ERICSSON'},
    {ID: 378,Employer_Name: 'ZF ACTIVE SAFETY US'},
    {ID: 379,Employer_Name: 'NSOR ENGINEERS'},
    {ID: 380,Employer_Name: 'TELEWORLD SOLUTIONS'},
    {ID: 381,Employer_Name: 'PRICEWATERHOUSEOPERS ADVISORY SERVICES'},
    {ID: 382,Employer_Name: 'RADIUMSOFT'},
    {ID: 383,Employer_Name: 'EAST TENNESSEE STATE UNIVERSITY'},
    {ID: 384,Employer_Name: 'ABBVIE'},
    {ID: 385,Employer_Name: 'TWITTER'},
    {ID: 386,Employer_Name: 'WARNERMEDIA DIRECT'},
    {ID: 387,Employer_Name: 'NRDIA UNIVERSITY'},
    {ID: 388,Employer_Name: 'ALLIANCEBERNSTEIN'},
    {ID: 389,Employer_Name: 'FISERV SOLUTIONS'},
    {ID: 390,Employer_Name: 'CASE WESTERN RESERVE UNIVERSITY'},
    {ID: 391,Employer_Name: 'OKLAHOMA STATE UNIVERSITY'},
    {ID: 392,Employer_Name: 'NINE INK'},
    {ID: 393,Employer_Name: 'ANDERSON AND ASSOCIATES'},
    {ID: 394,Employer_Name: 'ROCKWELL AUTOMATION'},
    {ID: 395,Employer_Name: 'ORACLE AMERICA'},
    {ID: 396,Employer_Name: 'ROOD RIDDLE EQUINE HOSPITAL'},
    {ID: 397,Employer_Name: 'TRU TECH SYSTEMS A DIVISION OF RESONETICS'},
    {ID: 398,Employer_Name: 'NEW YORK UNIVERSITY'},
    {ID: 399,Employer_Name: 'ESSANT TECHNOLOGIES NA'},
    {ID: 400,Employer_Name: 'AMERICAN FAMILY MUTUAL INSURANCE MPANY SI'},
    {ID: 401,Employer_Name: 'HITEK FORCE'},
    {ID: 402,Employer_Name: 'OATH HOLDINGS'},
    {ID: 403,Employer_Name: 'BUSINESS INTELLIGENCE SOLUTIONS'},
    {ID: 404,Employer_Name: 'DIVIS SOLUTIONS'},
    {ID: 405,Employer_Name: 'PHIS HEALTHCARE INFORMATICS'},
    {ID: 406,Employer_Name: 'EQUINIX'},
    {ID: 407,Employer_Name: 'WILMER TECHNOLOGIES'},
    {ID: 408,Employer_Name: 'AMAZON DEVEMENT CENTER US'},
    {ID: 409,Employer_Name: 'APPTIO'},
    {ID: 410,Employer_Name: 'SAS INSTITUTE'},
    {ID: 411,Employer_Name: 'DEMETRO'},
    {ID: 412,Employer_Name: 'BAIN MPANY'},
    {ID: 413,Employer_Name: 'INBASE'},
    {ID: 414,Employer_Name: 'MCKINSEY MPANY UNITED STATES'},
    {ID: 415,Employer_Name: 'EATON RAPIDS MEDICAL CENTER'},
    {ID: 416,Employer_Name: 'MORGAN STANLEY SERVICES GROUP'},
    {ID: 417,Employer_Name: 'AMERICAN EXPRESS TRAVEL RELATED SERVICES MPANY'},
    {ID: 418,Employer_Name: 'TESLA'},
    {ID: 419,Employer_Name: 'BOSTON LLEGE'},
    {ID: 420,Employer_Name: 'STATE OF WASHINGTON DEPT OF SOCIAL AND HEALTH SERVICES'},
    {ID: 421,Employer_Name: 'VERISILIN'},
    {ID: 422,Employer_Name: 'WEX'},
    {ID: 423,Employer_Name: 'NEW YORK LIFE INSURANCE MPANY'},
    {ID: 424,Employer_Name: 'HILTON DOMESTIC OPERATING MPANY'},
    {ID: 425,Employer_Name: 'GENERAL HOSPITAL ORATION'},
    {ID: 426,Employer_Name: 'XILINX'},
    {ID: 427,Employer_Name: 'CAREMARK'},
    {ID: 428,Employer_Name: 'SYNOPSYS'},
    {ID: 429,Employer_Name: 'UNIVERSITY OF LORADO'},
    {ID: 430,Employer_Name: 'WALMART ASSOCIATES'},
    {ID: 431,Employer_Name: 'PITT UNTY MEMORIAL HOSPITAL'},
    {ID: 432,Employer_Name: 'METIS SOFTWARE SOLUTIONS'},
    {ID: 433,Employer_Name: 'APPLIED MATERIALS'},
    {ID: 434,Employer_Name: 'AIRBNB'},
    {ID: 435,Employer_Name: 'THE STTS MPANY'},
    {ID: 436,Employer_Name: 'UNIVERSITY OF ROCHESTER'},
    {ID: 437,Employer_Name: 'UNIVERSITY OF PITTSBURGH'},
    {ID: 438,Employer_Name: 'PIVOTAL SOFTWARE'},
    {ID: 439,Employer_Name: 'DROPBOX'},
    {ID: 440,Employer_Name: 'AMERICAN WATER WORKS SERVICES MPANY'},
    {ID: 441,Employer_Name: 'TRACELINK'},
    {ID: 442,Employer_Name: 'JOBY AERO'},
    {ID: 443,Employer_Name: 'VULTUS'},
    {ID: 444,Employer_Name: 'NJOY'},
    {ID: 445,Employer_Name: 'NOKIA OF AMERICA ORATION'},
    {ID: 446,Employer_Name: 'ENVOY GLOBAL'},
    {ID: 447,Employer_Name: 'ILLUMINA'},
    {ID: 448,Employer_Name: 'GEISINGER SYSTEM SERVICES'},
    {ID: 449,Employer_Name: 'CURRENT HEALTH'},
    {ID: 450,Employer_Name: 'MEDICAL MUTUAL OF OHIO'},
    {ID: 451,Employer_Name: 'WAYFAIR'},
    {ID: 452,Employer_Name: 'PAYPAL'},
    {ID: 453,Employer_Name: 'WM RICE UNIVERSITY'},
    {ID: 454,Employer_Name: 'JUN WANG ASSOCIATES PC'},
    {ID: 455,Employer_Name: 'ROBLOX ORATION'},
    {ID: 456,Employer_Name: 'THE LIFE FINANCIAL GROUP'},
    {ID: 457,Employer_Name: 'REDFIN ORATION'},
    {ID: 458,Employer_Name: 'GEORGIA TELEVISION'},
    {ID: 459,Employer_Name: 'JH TECHNOLOGIES'},
    {ID: 460,Employer_Name: 'DELL USA'},
    {ID: 461,Employer_Name: 'MDLAND INTERNATIONAL ORATION'},
    {ID: 462,Employer_Name: 'TWIN CITY FAN MPANIES LTD'},
    {ID: 463,Employer_Name: 'BNP PARIBAS RCC'},
    {ID: 464,Employer_Name: 'REMITLY'},
    {ID: 465,Employer_Name: 'CSAA INSURANCE SERVICES'},
    {ID: 466,Employer_Name: 'FITNESS BI'},
    {ID: 467,Employer_Name: 'CDK GLOBAL'},
    {ID: 468,Employer_Name: 'FUTURE LABS VII'},
    {ID: 469,Employer_Name: 'NAGRA BRANDS'},
    {ID: 470,Employer_Name: 'YAMAHA MOTOR MANUFACTURING MPANY'},
    {ID: 471,Employer_Name: 'CHENMED'},
    {ID: 472,Employer_Name: 'CIS SYSTEMS'},
    {ID: 473,Employer_Name: 'TEXAS AM ENGINEERING EXPERIMENT STATION'},
    {ID: 474,Employer_Name: 'SEATTLE GENETICS'},
    {ID: 475,Employer_Name: 'GENZYME ORATION'},
    {ID: 476,Employer_Name: 'SECURITY NATIONWIDE'},
    {ID: 477,Employer_Name: 'BILKINS'},
    {ID: 478,Employer_Name: 'GENPACT'},
    {ID: 479,Employer_Name: 'ENTERM OPERATIONS'},
    {ID: 480,Employer_Name: 'THE UNIVERSITY OF ALABAMA AT BIRMINGHAM'},
    {ID: 481,Employer_Name: 'DRIV AUTOMOTIVE'},
    {ID: 482,Employer_Name: 'INVASYSTEMS DIGITAL'},
    {ID: 483,Employer_Name: 'EQUIFAX'},
    {ID: 484,Employer_Name: 'IQVIA'},
    {ID: 485,Employer_Name: 'CARNEGIE MELLON UNIVERSITY'},
    {ID: 486,Employer_Name: 'SAPIENT ORATION'},
    {ID: 487,Employer_Name: 'CHEN AND SUN CPA A PROFESSIONAL ORATION'},
    {ID: 488,Employer_Name: 'MMUNITY HEALTH CENTER OF BUFFALO'},
    {ID: 489,Employer_Name: 'UHV TECHNOLOGY'},
    {ID: 490,Employer_Name: 'TEVA PHARMACEUTICALS USA'},
    {ID: 491,Employer_Name: 'VPLS SOLUTIONS'},
    {ID: 492,Employer_Name: 'WAYNE STATE UNIVERSITY'},
    {ID: 493,Employer_Name: 'WORLDWIDE DMC USA'},
    {ID: 494,Employer_Name: 'FIG'},
    {ID: 495,Employer_Name: 'CLHOICE'},
    {ID: 496,Employer_Name: 'LOGAN INSTRUMENTS'},
    {ID: 497,Employer_Name: 'ADVERTEX MMUNICATIONS'},
    {ID: 498,Employer_Name: 'RUHA TECHNOLOGIES'},
    {ID: 499,Employer_Name: 'FLEETR TECHNOLOGIES'},
    {ID: 500,Employer_Name: 'TWITCH INTERACTIVE'},
    {ID: 501,Employer_Name: 'PALO ALTO MIND BODY'},
    {ID: 502,Employer_Name: 'TETRUS'},
    {ID: 503,Employer_Name: 'PAREXEL INTERNATIONAL'},
    {ID: 504,Employer_Name: 'L VUPPALA DDS DENTAL ORATION'},
    {ID: 505,Employer_Name: 'POSTMATES'},
    {ID: 506,Employer_Name: 'AMERIPRISE FINANCIAL'},
    {ID: 507,Employer_Name: 'LUMINAR TECHNOLOGIES'},
    {ID: 508,Employer_Name: 'PLANTRONICS'},
    {ID: 509,Employer_Name: 'AUDIBLE'},
    {ID: 510,Employer_Name: 'BAUMANN NSULTING'},
    {ID: 511,Employer_Name: 'INIQ CAPITAL'},
    {ID: 512,Employer_Name: 'LUMBIA UNIVERSITY'},
    {ID: 513,Employer_Name: 'PREFERRED THERAPY SOLUTIONS'},
    {ID: 514,Employer_Name: 'REED BUSINESS INFORMATION'},
    {ID: 515,Employer_Name: 'WONDERSTORM'},
    {ID: 516,Employer_Name: 'MANSUR GAVRIEL'},
    {ID: 517,Employer_Name: '1010DATA SERVICES'},
    {ID: 518,Employer_Name: 'TRIMBLE'},
    {ID: 519,Employer_Name: 'EFINANCIAL'},
    {ID: 520,Employer_Name: 'TMC USA NORTH EAST'},
    {ID: 521,Employer_Name: 'RXLOGIX ORATION'},
    {ID: 522,Employer_Name: 'TMOBILE USA'},
    {ID: 523,Employer_Name: 'MMS HOLDINGS'},
    {ID: 524,Employer_Name: 'MCKINSOL NSULTING'},
    {ID: 525,Employer_Name: 'NORTHWESTERN MUTUAL LIFE INSURANCE MPANY'},
    {ID: 526,Employer_Name: 'SALESFORCEM'},
    {ID: 527,Employer_Name: 'JOHNSON JOHNSON SERVICES'},
    {ID: 528,Employer_Name: 'LEK NSULTING'},
    {ID: 529,Employer_Name: 'TRUIST BANK'},
    {ID: 530,Employer_Name: 'TAILORED SHARED SERVICES'},
    {ID: 531,Employer_Name: 'RDEN PHARMA LORADO'},
    {ID: 532,Employer_Name: 'EAST WEST SYSTEMS'},
    {ID: 533,Employer_Name: 'MEARS GROUP'},
    {ID: 534,Employer_Name: 'BOSCH REXROTH ORATION'},
    {ID: 535,Employer_Name: 'LINDE GAS NORTH AMERICA'},
    {ID: 536,Employer_Name: 'BLACKROCK FINANCIAL MANAGEMENT'},
    {ID: 537,Employer_Name: 'LORRAINE DALESSIO A PROFESSIONAL LAW'},
    {ID: 538,Employer_Name: 'AURORA INNOVATION'},
    {ID: 539,Employer_Name: 'BAYER US'},
    {ID: 540,Employer_Name: 'REED SMITH'},
    {ID: 541,Employer_Name: 'PROPYLON'},
    {ID: 542,Employer_Name: 'NORDSTROM'},
    {ID: 543,Employer_Name: 'SAMSUNG ELECTRONICS AMERICA'},
    {ID: 544,Employer_Name: 'UNIVERSITY OF UTAH'},
    {ID: 545,Employer_Name: 'BLOOMBERG'},
    {ID: 546,Employer_Name: 'LEXISNEXIS USA'},
    {ID: 547,Employer_Name: 'MOTIONAL AD'},
    {ID: 548,Employer_Name: 'NESTLE PURINA PETCARE MPANY'},
    {ID: 549,Employer_Name: 'IOWA PHYSICIANS CLINIC MEDICAL FOUNDATION'},
    {ID: 550,Employer_Name: 'NU REV MMUNICATIONS'},
    {ID: 551,Employer_Name: 'AMDOCS'},
    {ID: 552,Employer_Name: 'SQUARE'},
    {ID: 553,Employer_Name: 'ST JOHNS UNIVERSITY'},
    {ID: 554,Employer_Name: 'SHELL EXPLORATION AND PRODUCTION MPANY'},
    {ID: 555,Employer_Name: 'IVY INVESTMENT MANAGEMENT'},
    {ID: 556,Employer_Name: 'TIVITI'},
    {ID: 557,Employer_Name: 'CHARLES SCHWAB AND MPANY'},
    {ID: 558,Employer_Name: 'TISSA TECHNOLOGY'},
    {ID: 559,Employer_Name: 'I2U SYSTEMS'},
    {ID: 560,Employer_Name: 'VEEVA SYSTEMS'},
    {ID: 561,Employer_Name: 'ATLASSIAN'},
    {ID: 562,Employer_Name: 'DAVITA'},
    {ID: 563,Employer_Name: 'STEVENS INSTITUTE OF TECHNOLOGY'},
    {ID: 564,Employer_Name: 'BANKER STEEL'},
    {ID: 565,Employer_Name: 'SOFTWARE GUIDANCE ASSISTANCE'},
    {ID: 566,Employer_Name: 'PREZIBA'},
    {ID: 567,Employer_Name: 'ECTOR UNTY INDEPENDENT SCHOOL DISTRICT'},
    {ID: 568,Employer_Name: 'GROCERY DELIVERY ESERVICES USA'},
    {ID: 569,Employer_Name: 'IT CATALYST GLOBAL SOLUTIONS'},
    {ID: 570,Employer_Name: 'SHOEBUYM'},
    {ID: 571,Employer_Name: 'BILL ME LATER'},
    {ID: 572,Employer_Name: 'BETH ISRAEL DEANESS MEDICAL CENTER'},
    {ID: 573,Employer_Name: 'NIKE'},
    {ID: 574,Employer_Name: 'AEM TECHNICAL SERVICES'},
    {ID: 575,Employer_Name: 'THE NEW YORK TIMES MPANY'},
    {ID: 576,Employer_Name: 'DH DISTRIBUTING'},
    {ID: 577,Employer_Name: 'CENTENE MANAGEMENT MPANY'},
    {ID: 578,Employer_Name: 'Q2 SOFTWARE'},
    {ID: 579,Employer_Name: 'JABIL'},
    {ID: 580,Employer_Name: 'ANSYS'},
    {ID: 581,Employer_Name: 'WANDIS'},
    {ID: 582,Employer_Name: 'QAD'},
    {ID: 583,Employer_Name: 'IMVU'},
    {ID: 584,Employer_Name: 'ATLANTA MUSIC PROJECT'},
    {ID: 585,Employer_Name: 'M3 ACUNTING SERVICES'},
    {ID: 586,Employer_Name: 'QUICKEN LOANS'},
    {ID: 587,Employer_Name: 'GOLDMAN SACHS'},
    {ID: 588,Employer_Name: 'OPER TIRE RUBBER MPANY'},
    {ID: 589,Employer_Name: 'WIMMER SOLUTIONS ORATION'},
    {ID: 590,Employer_Name: 'PURPOSE FINANCIAL'},
    {ID: 591,Employer_Name: 'WOLFSDORF ROSENTHA'},
    {ID: 592,Employer_Name: 'DOCUSIGN'},
    {ID: 593,Employer_Name: 'MINDGRUB TECHNOLOGIES'},
    {ID: 594,Employer_Name: 'LIGHTBEAMAI'},
    {ID: 595,Employer_Name: 'ARIZONA STATE UNIVERSITY'},
    {ID: 596,Employer_Name: 'MCKESSON ORATION'},
    {ID: 597,Employer_Name: 'MARKEL ORATION'},
    {ID: 598,Employer_Name: 'UNIVERSITY OF MASSACHUSETTS AMHERST'},
    {ID: 599,Employer_Name: 'PEPSI'},
    {ID: 600,Employer_Name: 'FORD MOTOR MPANY'},
    {ID: 601,Employer_Name: 'VERVENEST TECHNOLOGIES'},
    {ID: 602,Employer_Name: 'AGYLE NETWORKS'},
    {ID: 603,Employer_Name: 'INGRAM MICRO'},
    {ID: 604,Employer_Name: 'MACYS SYSTEMS AND TECHNOLOGY'},
    {ID: 605,Employer_Name: 'AMG TECHNOLOGY'},
    {ID: 606,Employer_Name: 'DOORDASH'},
    {ID: 607,Employer_Name: 'AUTOZONE'},
    {ID: 608,Employer_Name: 'HTC GLOBAL SERVICES'},
    {ID: 609,Employer_Name: 'PALO ALTO NETWORKS'},
    {ID: 610,Employer_Name: 'NETNUMBER'},
    {ID: 611,Employer_Name: 'DISVER PRODUCTS'},
    {ID: 612,Employer_Name: 'CB NEPTUNE HOLDINGS'},
    {ID: 613,Employer_Name: 'NATIONAL UNION FIRE INSURANCE MPANY OF PITTSBURGH PA'},
    {ID: 614,Employer_Name: 'SARTORIUS STEDIM NORTH AMERICA'},
    {ID: 615,Employer_Name: 'HONEYWELL INTERNATIONAL'},
    {ID: 616,Employer_Name: 'TRINET USA'},
    {ID: 617,Employer_Name: 'IBM INDIA'},
    {ID: 618,Employer_Name: 'SAP LABS'},
    {ID: 619,Employer_Name: 'MEDPHARMEX'},
    {ID: 620,Employer_Name: 'CHOCTAW NATION OF OKLAHOMA'},
    {ID: 621,Employer_Name: 'TECHSWITCH'},
    {ID: 622,Employer_Name: 'XCEED TECHNOLOGIES'},
    {ID: 623,Employer_Name: 'SAGE AUTOMOTIVE INTERIORS'},
    {ID: 624,Employer_Name: 'DEXM'},
    {ID: 625,Employer_Name: 'HUMANA'},
    {ID: 626,Employer_Name: 'ELLIE MAE'},
    {ID: 627,Employer_Name: 'CAMBRIDGE MOBILE TELEMATICS'},
    {ID: 628,Employer_Name: 'CSS PAYROLL'},
    {ID: 629,Employer_Name: 'SP GLOBAL MARKET INTELLIGENCE'},
    {ID: 630,Employer_Name: 'ULTERIOR MOTIVES INTERNATIONAL'},
    {ID: 631,Employer_Name: 'CAPTIVEAIRE SYSTEMS'},
    {ID: 632,Employer_Name: 'IDEAL INDUSTRIES LIGHTING'},
    {ID: 633,Employer_Name: 'DART NTAINER OF MICHIGAN'},
    {ID: 634,Employer_Name: 'CARIS SCIENCE'},
    {ID: 635,Employer_Name: 'NEWPORT ORATION'},
    {ID: 636,Employer_Name: 'SSMSLUH'},
    {ID: 637,Employer_Name: 'EXPRESS SCRIPTS PHARMACY'},
    {ID: 638,Employer_Name: 'INNOVAPPTIVE'}]);
}

function insertEmployerName (employerNames) {
    console.log('inserting employers');
    return new Promise((resolve, reject)=>{
        Employer_Names.bulkCreate(employerNames).then (result=> {
            console.log('employer name inserted: ' + employerNames.length);
            resolve(result);
        }).catch( (err) => {
            console.log('error while inserting employer', err);
            reject(err);
        })
    })
}

function insertCase (bulkData, rowIteration) {
    console.log('inserting case - ' + rowIteration);
    return new Promise((resolve, reject)=>{
        h1B_DATA_new.bulkCreate(bulkData).then (result=> {
            console.log('data inserted: ' + rowIteration);
            resolve(result);
        }).catch( (err)=>{
            console.log('error while inserting data' + rowIteration, err);
            reject(err);
        })
    });
}

function getAllEmployers () {
    return new Promise ((resolve, reject) => {
        Employer_Names.findAll({raw: true}).then(employerNames => {
            if (employerNames && Array.isArray(employerNames) && employerNames.length) {
                resolve(employerNames);
            } else {
                resolve([]);
            }
        }).catch( (err) => {
            console.log('error while fetching all employers', err);
            reject(err);
        })
    })
}

function executeAllFiles () {
    filesExecuted++;
    if (filesExecuted <= 4) {
        filePath = './public/excel/LCA_Disclosure_Data_FY2021_Q'+filesExecuted+'.xlsx';
    }
    initializeImport();
}

// insertEmploye();

exports.initializeImport = initializeImport;