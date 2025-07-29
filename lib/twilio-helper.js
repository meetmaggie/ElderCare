
// Twilio helper functions for the eldercare calling system

export function validateTwilioCredentials() {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing Twilio credentials: ${missing.join(', ')}`)
  }
  
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  }
}

export function formatPhoneNumber(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Add +1 if it's a 10-digit US number
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  // Add + if it starts with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  return phone
}

export function parseWebhookData(formData) {
  const data = {}
  for (const [key, value] of formData.entries()) {
    data[key] = value
  }
  return data
}

export function generateTwiML(instructions) {
  let twiml = '<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n'
  
  instructions.forEach(instruction => {
    switch (instruction.type) {
      case 'say':
        twiml += `  <Say voice="${instruction.voice || 'Polly.Joanna'}">${instruction.text}</Say>\n`
        break
      case 'connect':
        twiml += '  <Connect>\n'
        if (instruction.stream) {
          twiml += `    <Stream url="${instruction.stream.url}">\n`
          Object.entries(instruction.stream.parameters || {}).forEach(([key, value]) => {
            twiml += `      <Parameter name="${key}" value="${value}" />\n`
          })
          twiml += '    </Stream>\n'
        }
        twiml += '  </Connect>\n'
        break
      case 'hangup':
        twiml += '  <Hangup />\n'
        break
    }
  })
  
  twiml += '</Response>'
  return twiml
}

export async function makeTwilioRequest(endpoint, method = 'POST', data = {}) {
  const credentials = validateTwilioCredentials()
  const auth = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString('base64')
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: method === 'POST' ? new URLSearchParams(data) : undefined
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio API error: ${response.status} - ${error}`)
  }
  
  return await response.json()
}
