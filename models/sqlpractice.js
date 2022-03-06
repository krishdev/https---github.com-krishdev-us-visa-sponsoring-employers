const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/dbconfig');

var h1B_DATA_new = sequelize.define('h1B_DATA_new', {
    CASE_NUMBER: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'CASE_NUMBER',
        primaryKey: true
    },
    CASE_STATUS: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'CASE_STATUS',
    },
    RECEIVED_DATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'RECEIVED_DATE',
    },
    DECISION_DATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'DECISION_DATE',
    },
    ORIGINAL_CERT_DATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'ORIGINAL_CERT_DATE',
    },
    VISA_CLASS: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'VISA_CLASS',
    },
    JOB_TITLE: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'JOB_TITLE',
    },
    SOC_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'SOC_CODE',
    },
    SOC_TITLE: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'SOC_TITLE',
    },
    FULL_TIME_POSITION: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'FULL_TIME_POSITION',
    },
    BEGIN_DATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'BEGIN_DATE',
    },
    END_DATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'END_DATE',
    },
    TOTAL_WORKER_POSITIONS: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'TOTAL_WORKER_POSITIONS',
    },
    NEW_EMPLOYMENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'NEW_EMPLOYMENT',
    },
    CONTINUED_EMPLOYMENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'CONTINUED_EMPLOYMENT',
    },
    CHANGE_PREVIOUS_EMPLOYMENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'CHANGE_PREVIOUS_EMPLOYMENT',
    },
    NEW_CONCURRENT_EMPLOYMENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'NEW_CONCURRENT_EMPLOYMENT',
    },
    CHANGE_EMPLOYER: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'CHANGE_EMPLOYER',
    },
    AMENDED_PETITION: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AMENDED_PETITION',
    },
    EMPLOYER_NAME: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'EMPLOYER_NAME',
    },
    TRADE_NAME_DBA: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'TRADE_NAME_DBA',
    },
    EMPLOYER_ADDRESS1: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_ADDRESS1',
    },
    EMPLOYER_ADDRESS2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_ADDRESS2',
    },
    EMPLOYER_CITY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_CITY',
    },
    EMPLOYER_STATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_STATE',
    },
    EMPLOYER_POSTAL_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POSTAL_CODE',
    },
    EMPLOYER_COUNTRY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_COUNTRY',
    },
    EMPLOYER_PROVINCE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_PROVINCE',
    },
    EMPLOYER_PHONE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_PHONE',
    },
    EMPLOYER_PHONE_EXT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_PHONE_EXT',
    },
    NAICS_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'NAICS_CODE',
    },
    EMPLOYER_POC_LAST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_LAST_NAME',
    },
    EMPLOYER_POC_FIRST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_FIRST_NAME',
    },
    EMPLOYER_POC_MIDDLE_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_MIDDLE_NAME',
    },
    EMPLOYER_POC_JOB_TITLE: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_POC_JOB_TITLE',
    },
    EMPLOYER_POC_ADDRESS_1: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_POC_ADDRESS_1',
    },
    EMPLOYER_POC_ADDRESS_2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_POC_ADDRESS_2',
    },
    EMPLOYER_POC_CITY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_CITY',
    },
    EMPLOYER_POC_STATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_STATE',
    },
    EMPLOYER_POC_POSTAL_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_POSTAL_CODE',
    },
    EMPLOYER_POC_COUNTRY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_COUNTRY',
    },
    EMPLOYER_POC_PROVINCE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_PROVINCE',
    },
    EMPLOYER_POC_PHONE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_PHONE',
    },
    EMPLOYER_POC_PHONE_EXT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'EMPLOYER_POC_PHONE_EXT',
    },
    EMPLOYER_POC_EMAIL: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'EMPLOYER_POC_EMAIL',
    },
    AGENT_REPRESENTING_EMPLOYER: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_REPRESENTING_EMPLOYER',
    },
    AGENT_ATTORNEY_LAST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_LAST_NAME',
    },
    AGENT_ATTORNEY_FIRST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_FIRST_NAME',
    },
    AGENT_ATTORNEY_MIDDLE_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_MIDDLE_NAME',
    },
    AGENT_ATTORNEY_ADDRESS1: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'AGENT_ATTORNEY_ADDRESS1',
    },
    AGENT_ATTORNEY_ADDRESS2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'AGENT_ATTORNEY_ADDRESS2',
    },
    AGENT_ATTORNEY_CITY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_CITY',
    },
    AGENT_ATTORNEY_STATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_STATE',
    },
    AGENT_ATTORNEY_POSTAL_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_POSTAL_CODE',
    },
    AGENT_ATTORNEY_COUNTRY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_COUNTRY',
    },
    AGENT_ATTORNEY_PROVINCE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_PROVINCE',
    },
    AGENT_ATTORNEY_PHONE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_PHONE',
    },
    AGENT_ATTORNEY_PHONE_EXT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGENT_ATTORNEY_PHONE_EXT',
    },
    AGENT_ATTORNEY_EMAIL_ADDRESS: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'AGENT_ATTORNEY_EMAIL_ADDRESS',
    },
    LAWFIRM_NAME_BUSINESS_NAME: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'LAWFIRM_NAME_BUSINESS_NAME',
    },
    STATE_OF_HIGHEST_COURT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'STATE_OF_HIGHEST_COURT',
    },
    NAME_OF_HIGHEST_STATE_COURT: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'NAME_OF_HIGHEST_STATE_COURT',
    },
    WORKSITE_WORKERS: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WORKSITE_WORKERS',
    },
    SECONDARY_ENTITY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'SECONDARY_ENTITY',
    },
    SECONDARY_ENTITY_BUSINESS_NAME: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'SECONDARY_ENTITY_BUSINESS_NAME',
    },
    WORKSITE_ADDRESS1: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'WORKSITE_ADDRESS1',
    },
    WORKSITE_ADDRESS2: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'WORKSITE_ADDRESS2',
    },
    WORKSITE_CITY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WORKSITE_CITY',
    },
    WORKSITE_COUNTY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WORKSITE_COUNTY',
    },
    WORKSITE_STATE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WORKSITE_STATE',
    },
    WORKSITE_POSTAL_CODE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WORKSITE_POSTAL_CODE',
    },
    WAGE_RATE_OF_PAY_FROM: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WAGE_RATE_OF_PAY_FROM',
    },
    WAGE_RATE_OF_PAY_TO: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WAGE_RATE_OF_PAY_TO',
    },
    WAGE_UNIT_OF_PAY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WAGE_UNIT_OF_PAY',
    },
    PREVAILING_WAGE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PREVAILING_WAGE',
    },
    PW_UNIT_OF_PAY: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_UNIT_OF_PAY',
    },
    PW_TRACKING_NUMBER: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_TRACKING_NUMBER',
    },
    PW_WAGE_LEVEL: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_WAGE_LEVEL',
    },
    PW_OES_YEAR: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_OES_YEAR',
    },
    PW_OTHER_SOURCE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_OTHER_SOURCE',
    },
    PW_OTHER_YEAR: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PW_OTHER_YEAR',
    },
    PW_SURVEY_PUBLISHER: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'PW_SURVEY_PUBLISHER',
    },
    PW_SURVEY_NAME: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'PW_SURVEY_NAME',
    },
    TOTAL_WORKSITE_LOCATIONS: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'TOTAL_WORKSITE_LOCATIONS',
    },
    AGREE_TO_LC_STATEMENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AGREE_TO_LC_STATEMENT',
    },
    H1B_DEPENDENT: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'H1B_DEPENDENT',
    },
    WILLFUL_VIOLATOR: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'WILLFUL_VIOLATOR',
    },
    SUPPORT_H1B: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'SUPPORT_H1B',
    },
    STATUTORY_BASIS: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'STATUTORY_BASIS',
    },
    APPENDIX_A_ATTACHED: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'APPENDIX_A_ATTACHED',
    },
    PUBLIC_DISCLOSURE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PUBLIC_DISCLOSURE',
    },
    PREPARER_LAST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PREPARER_LAST_NAME',
    },
    PREPARER_FIRST_NAME: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PREPARER_FIRST_NAME',
    },
    PREPARER_MIDDLE_INITIAL: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PREPARER_MIDDLE_INITIAL',
    },
    PREPARER_BUSINESS_NAME: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'PREPARER_BUSINESS_NAME',
    },
    PREPARER_EMAIL: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'PREPARER_EMAIL',
    }
},{
    freezeTableName: true,
    timestamps: false,
    underscored: true
})

module.exports = h1B_DATA_new;