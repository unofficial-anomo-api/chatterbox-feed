import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Push Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailUpdates">Email Updates</Label>
              <Switch
                id="emailUpdates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <Switch
                id="darkMode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;