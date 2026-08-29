export interface LoanOffer {
  id:string;
  name:string;
  principal:number;
  financingCostRate:number;
  installments:number;
  description:string;
}

export interface Loan {
  id:string;
  offerId:string;
  name:string;
  principal:number;
  financingCost:number;
  totalRepayment:number;
  installments:number;
  paymentsMade:number;
  installmentAmount:number;
  balance:number;
}

export const FINANCING_OFFERS:LoanOffer[]=[
  {id:'working-500',name:'Betriebsmittelkredit',principal:500_000,financingCostRate:.06,installments:10,description:'Kleine Reserve für Bunker, Reparaturen und kurzfristige Liquidität.'},
  {id:'fleet-1250',name:'Flottenkredit',principal:1_250_000,financingCostRate:.09,installments:15,description:'Finanziert einen größeren Flottenschritt mit planbarer mittlerer Rate.'},
  {id:'expansion-2500',name:'Expansionskredit',principal:2_500_000,financingCostRate:.12,installments:20,description:'Hoher Kapitalhebel für große Schiffe – mit entsprechendem Schuldendienst.'}
];

export function offerById(id:string):LoanOffer|undefined{return FINANCING_OFFERS.find(o=>o.id===id);}
export function previewLoan(offer:LoanOffer):Omit<Loan,'id'|'paymentsMade'|'balance'>{const financingCost=Math.round(offer.principal*offer.financingCostRate),totalRepayment=offer.principal+financingCost,installmentAmount=Math.ceil(totalRepayment/offer.installments);return{offerId:offer.id,name:offer.name,principal:offer.principal,financingCost,totalRepayment,installments:offer.installments,installmentAmount};}
export function createLoan(offer:LoanOffer,sequence:number):Loan{const p=previewLoan(offer);return{...p,id:`loan-${offer.id}-${sequence}`,paymentsMade:0,balance:p.totalRepayment};}
export function nextInstallment(loan:Loan):number{return Math.min(loan.installmentAmount,loan.balance);}
export function outstandingDebt(loans:Loan[]):number{return loans.reduce((sum,l)=>sum+l.balance,0);}
export function monthlyDebtService(loans:Loan[]):number{return loans.reduce((sum,l)=>sum+nextInstallment(l),0);}

export type FinanceRisk='low'|'medium'|'high';
export interface FinanceRiskAssessment {level:FinanceRisk; reserveAfterFunding:number; monthlyDebtService:number; message:string;}
export function assessFinancingRisk(cash:number,vesselCount:number,loans:Loan[],offer:LoanOffer):FinanceRiskAssessment{
  const preview=previewLoan(offer),reserveAfterFunding=cash+offer.principal,monthly=monthlyDebtService(loans)+preview.installmentAmount;
  const safetyReserve=200_000+vesselCount*75_000;
  const coverage=(reserveAfterFunding-safetyReserve)/Math.max(1,monthly);
  if(coverage<2)return{level:'high',reserveAfterFunding,monthlyDebtService:monthly,message:'Hohe Belastung: Nach Sicherheitsreserve sind weniger als zwei Monatsraten gedeckt.'};
  if(coverage<5)return{level:'medium',reserveAfterFunding,monthlyDebtService:monthly,message:'Mittlere Belastung: Schuldendienst ist tragbar, reduziert aber die operative Reserve deutlich.'};
  return{level:'low',reserveAfterFunding,monthlyDebtService:monthly,message:'Niedrige Belastung: Die aktuelle Liquidität deckt mehrere Raten zusätzlich zur Sicherheitsreserve.'};
}
