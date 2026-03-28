import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Delete, LogIn } from "lucide-react";

export default function FieldLogin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const employee = localStorage.getItem("fieldEmployee");
    if (employee) {
      setLocation("/field/log");
    }
    apiRequest("POST", "/api/field/seed").catch(() => {});
  }, []);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) {
      toast({ title: "Error", description: "Please enter a 4-digit PIN", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/field/auth", { pin });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("fieldEmployee", JSON.stringify(data.employee));
        localStorage.setItem("fieldPin", pin);
        toast({ title: "Welcome", description: `Signed in as ${data.employee.name}` });
        setLocation("/field/log");
      }
    } catch (error: any) {
      toast({ title: "Invalid PIN", description: "Please try again", variant: "destructive" });
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">APS Field Service</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your 4-digit PIN</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-bold transition-all ${
                  pin.length > i
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {pin.length > i ? "\u2022" : ""}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit, i) => {
              if (i === 9) return <div key="empty1" />;
              if (i === 11) {
                return (
                  <Button
                    key="delete"
                    variant="outline"
                    className="h-14 text-lg"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Delete className="w-5 h-5" />
                  </Button>
                );
              }
              return (
                <Button
                  key={digit}
                  variant="outline"
                  className="h-14 text-xl font-semibold"
                  onClick={() => handlePinInput(digit)}
                  disabled={loading}
                >
                  {digit}
                </Button>
              );
            })}
          </div>

          {loading && (
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Verifying...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
