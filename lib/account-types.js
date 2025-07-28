
export const ACCOUNT_TYPES = {
  DEMO: 'demo',
  TEST: 'test', 
  REGULAR: 'regular'
}

export function getAccountType(email) {
  if (!email) return ACCOUNT_TYPES.REGULAR
  
  // Check for demo accounts
  if (email === 'sarah.johnson.demo@gmail.com' || 
      email === 'david.chen.demo@gmail.com' || 
      email === 'emma.thompson.demo@gmail.com') {
    return ACCOUNT_TYPES.DEMO
  }
  
  // Check for test accounts
  if (email.endsWith('@test.local')) {
    return ACCOUNT_TYPES.TEST
  }
  
  return ACCOUNT_TYPES.REGULAR
}

export function shouldBypassPayment(email) {
  const accountType = getAccountType(email)
  return accountType === ACCOUNT_TYPES.DEMO || accountType === ACCOUNT_TYPES.TEST
}

export function shouldUseRealData(email) {
  const accountType = getAccountType(email)
  return accountType === ACCOUNT_TYPES.TEST || accountType === ACCOUNT_TYPES.REGULAR
}

export function shouldUseDemoData(email) {
  const accountType = getAccountType(email)
  return accountType === ACCOUNT_TYPES.DEMO
}
