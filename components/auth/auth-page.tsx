"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import { fetchCountries, type Country } from "@/lib/api/countries"
import { sendOTP, verifyOTP } from "@/lib/utils/otp"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Smartphone } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
})

type PhoneFormData = z.infer<typeof phoneSchema>
type OTPFormData = z.infer<typeof otpSchema>

export default function AuthPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [phoneData, setPhoneData] = useState<PhoneFormData | null>(null)
  const { login } = useAuthStore()
  const { toast } = useToast()

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phone: "",
      name: "",
    },
  })

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    const loadCountries = async () => {
      const countryData = await fetchCountries()
      setCountries(countryData)
    }
    loadCountries()
  }, [])

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsLoading(true)
    try {
      const success = await sendOTP(data.phone, data.countryCode)
      if (success) {
        setPhoneData(data)
        setStep("otp")
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${data.countryCode}${data.phone}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: OTPFormData) => {
    if (!phoneData) return

    setIsLoading(true)
    try {
      const success = await verifyOTP(phoneData.phone, phoneData.countryCode, data.otp)
      if (success) {
        const user = {
          id: `user_${Date.now()}`,
          phone: phoneData.phone,
          countryCode: phoneData.countryCode,
          name: phoneData.name,
        }
        login(user)
        toast({
          title: "Welcome!",
          description: "Successfully logged in to Gemini Chat",
        })
      } else {
        toast({
          title: "Invalid OTP",
          description: "Please check your OTP and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gemini Chat
          </CardTitle>
          <CardDescription>
            {step === "phone" ? "Enter your phone number to get started" : "Enter the verification code"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" {...phoneForm.register("name")} />
                {phoneForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{phoneForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select onValueChange={(value) => phoneForm.setValue("countryCode", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.idd.root} value={`${country.idd.root}${country.idd.suffixes[0] || ""}`}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name.common}</span>
                          <span className="text-muted-foreground">
                            {country.idd.root}
                            {country.idd.suffixes[0] || ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {phoneForm.formState.errors.countryCode && (
                  <p className="text-sm text-red-500 mt-1">{phoneForm.formState.errors.countryCode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" {...phoneForm.register("phone")} />
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input id="otp" placeholder="Enter 6-digit OTP" maxLength={6} {...otpForm.register("otp")} />
                {otpForm.formState.errors.otp && (
                  <p className="text-sm text-red-500 mt-1">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("phone")}>
                Back to Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
