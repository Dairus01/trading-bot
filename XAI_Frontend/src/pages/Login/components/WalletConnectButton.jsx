import { ROUTES } from "@/routes/routes";
import { useLoginMutation } from "@/services/authApi";
import {
  clearToken,
  clearUser,
  setToken,
  setUser,
} from "@/store/slices/authSlice";
import { truncateText } from "@/utility/truncateText";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useWalletModal,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import base58 from "bs58";
import { Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WalletConnectButton = () => {
  const [loading, setLoading] = useState(false);

  const { connecting, connected, signMessage, publicKey, disconnect } =
    useWallet();
  const { visible } = useWalletModal();
  const [loginMutation, { isLoading: loginIsLoading, error: loginError }] =
    useLoginMutation();

  const navigation = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);

  const handleDisconnect = () => {
    disconnect();
    setLoading(false);
    setTimeout(() => {
      dispatch(clearUser());
      dispatch(clearToken());
    }, 300);
  };

  useEffect(() => {
    if (loginError) {
      handleDisconnect();
    }
  }, [loginError]);

  useEffect(() => {
    if (!visible && !publicKey && !connecting && !loading) {
      handleDisconnect();
    }
  }, [visible, publicKey, loading, connecting]);

  useEffect(() => {
    if (!visible && !publicKey && !connecting) {
      setLoading(false);
    }
  }, [visible, publicKey, connecting]);

  const login = useCallback(
    async (payload) => {
      try {
        const response = await loginMutation({
          publicKey: payload?.walletAddress,
          signature: payload?.signature,
        }).unwrap();

        if (response) {
          toast.success("Login successful");
          dispatch(setUser(response?.data?.user));
          dispatch(setToken(response?.data?.jwt_token));
          navigation(ROUTES.DASHBOARD);
        }
      } catch (error) {
        console.log("error", error);
        toast.error(error?.data?.message || "Failed to Login");
      }
    },
    [dispatch, loginMutation, navigation]
  );

  const handleSignMessage = async () => {
    if (!publicKey) {
      toast.warning("Wallet not connected!");
      return;
    }

    try {
      const message = new TextEncoder().encode(
        "Please sign this message to connect"
      );
      const signedMessage = await signMessage(message);

      login({
        walletAddress: publicKey?.toString(),
        signature: base58.encode(signedMessage),
      });
    } catch (error) {
      toast.error(error?.message || "Signature request rejected");
      handleDisconnect();
    }
  };

  useEffect(() => {
    if (connected && !token) {
      console.log("token", token);
      setLoading(true);
      handleSignMessage();
    }
  }, [connected, token]);

  return (
    <>
      <WalletMultiButton style={{ backgroundColor: "blue" }}>
        {!publicKey && !loading ? "Connect Wallet" : null}
        {publicKey && !loading
          ? `${truncateText(publicKey.toString(), 6, 8)}`
          : null}
        {loading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </div>
        )}
      </WalletMultiButton>
    </>
  );
};

export default WalletConnectButton;
