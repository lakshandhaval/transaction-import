const { validateRows } = require('./validation.service');

const rows = [
  { transaction_id: 'T001', customer_name: 'Ravi', account_number: '123', amount: '5000' },
  { transaction_id: 'T002', customer_name: 'Priya', account_number: '456', amount: '0' },
  { transaction_id: 'T003', customer_name: '', account_number: '789', amount: '700' },
  { transaction_id: 'T004', customer_name: 'Neha', account_number: '321', amount: 'abc' },
  { transaction_id: 'T001', customer_name: 'Dup', account_number: '654', amount: '100' },
  { transaction_id: '', customer_name: '', account_number: '', amount: '' },
  { transaction_id: 'T007', customer_name: 'Kiran', account_number: '987', amount: '-50' },
];

console.log(JSON.stringify(validateRows(rows), null, 2));