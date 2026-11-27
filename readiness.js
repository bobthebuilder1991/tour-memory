export function readiness({income, housing, debt, expenses, savings, upfront, ratio=3}) {
 for(const n of [income,housing,debt,expenses,savings,upfront,ratio]) if(!Number.isFinite(n)||n<0) throw Error('Enter nonnegative numbers');
 if(!income||!ratio) throw Error('Income and screening multiplier must be positive');
 const remaining=income-housing-debt-expenses, cash=savings-upfront;
 return {remaining,cash, housingRatio:housing/income, screeningIncome:housing*ratio, reserveMonths:housing+debt+expenses?cash/(housing+debt+expenses):null};
}
export const checklists={Lease:['Rent and mandatory fees','Deposit and refund terms','Renewal and notice period','Early termination','Maintenance responsibilities','Pet and guest policies','Utilities and insurance'],Inspection:['Water damage or visible moisture','Plumbing and water pressure','Heating and cooling','Electrical outlets and lighting','Doors, windows and locks','Smoke and carbon monoxide alarms','Professional inspection if needed'],Move:['Confirm move date','Arrange movers','Transfer utilities','Update address','Document move-in condition','Confirm keys and access'],Live:['Track maintenance requests','Review renewal notice deadline','Check insurance renewal','Record warranties and repairs']};
