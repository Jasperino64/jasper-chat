"use client"
import { Button } from "@/components/ui/button"
import React from "react"
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components"

function AuthButtons() {
    const [isLoading, setIsLoading] = React.useState(false)
    return (
        <div className="flex gap-3 flex-1 md:flex-row flex-col relative z-50">
            <RegisterLink className="flex-1">
                <Button className="w-full" variant="outline" onClick={() => setIsLoading(true)} disabled>
                    Sign Up
                </Button>
            </RegisterLink>
            <LoginLink className="flex-1">
                <Button className="w-full" disabled={isLoading}>Login</Button>
            </LoginLink>
        </div>
    )
}

export default AuthButtons
