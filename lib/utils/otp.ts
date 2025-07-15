export const sendOTP = async (phone: string, countryCode: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`OTP sent to ${countryCode}${phone}`)
      resolve(true)
    }, 1000)
  })
}

export const verifyOTP = async (phone: string, countryCode: string, otp: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demo purposes, accept any 6-digit OTP
      resolve(otp.length === 6 && /^\d+$/.test(otp))
    }, 1500)
  })
}
