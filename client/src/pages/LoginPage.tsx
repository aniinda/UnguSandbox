import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Database, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold">Data Engineer Portal</CardTitle>
          <p className="text-gray-600">Rate Card Processing System</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">Authorized Access Only</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                This portal is restricted to authorized data engineers
              </p>
            </div>
            
            <Button 
              onClick={login} 
              className="w-full bg-primary hover:bg-blue-700"
            >
              Access Data Engineer Portal
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Secure document processing with AI-powered extraction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
