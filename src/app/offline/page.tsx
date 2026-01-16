"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Home, WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="Offline min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="max-w-[600px] w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <WifiOff className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Bạn đang offline</CardTitle>
            <CardDescription>
              Không có kết nối internet. Vui lòng kiểm tra kết nối mạng của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Trang này được cache để bạn có thể truy cập ngay cả khi không có
              internet. Một số tính năng có thể không hoạt động đầy đủ.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
