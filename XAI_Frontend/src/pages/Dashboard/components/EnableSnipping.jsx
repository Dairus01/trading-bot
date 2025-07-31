import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useEnableSnippingMutation } from "@/services/configurationApi";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const EnableSnipping = ({ enable }) => {
  const [checked, setChecked] = useState(false);

  const [enableSnippingMutation, { isLoading: enableSnippingIsLoading }] =
    useEnableSnippingMutation();

  useEffect(() => {
    setChecked(enable);
  }, [enable]);

  const handleEnableSnipping = useCallback(
    async (newVal) => {
      setChecked(newVal);

      const payload = {
        autoBuyEnable: newVal,
      };

      console.log("handleEnableSnipping, payload-->", payload);

      try {
        const response = await enableSnippingMutation(payload).unwrap();

        console.log("response-->", response);
        toast.success(response?.message || "Snipping is Enabled Successfully.");
      } catch (err) {
        console.log("error-->", err);
        toast.error(err?.data?.message || "Error Occured!");
      }
    },
    [enableSnippingMutation]
  );

  return (
    <>
      <Card className="min-w-[343px] w-[343px] max-w-full bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
        <CardHeader>
          <CardTitle className="text-gray-800 leading-1.5">
            Enable Snipping
          </CardTitle>
          <CardDescription className="text-gray-500">
            Toggle snipping feature on or off
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full h-full">
          {!enableSnippingIsLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <Switch
                checked={checked}
                onCheckedChange={handleEnableSnipping}
                disabled={enableSnippingIsLoading}
                aria-readonly={false}
                className="data-[state=checked]:bg-purple-500/70 data-[state=unchecked]:bg-purple-600/20"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center mt-4">
              <Loader2 className="h-14 w-14 text-purple-500/50 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default EnableSnipping;
