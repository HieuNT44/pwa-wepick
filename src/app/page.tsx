"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to login
    router.push("/login");
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Đang chuyển hướng...</p>
      </div>
    </div>
  );

  const handleToastDemo = () => {
    toast({
      title: "Toast Demo",
      description: "Đây là một toast notification từ shadcn/ui",
    });
  };
  
  const handleButtonClick = (buttonName: string) => {
    trackEvent("button_click", { button_name: buttonName });
  };

  return (
    <div className="Home min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">WePick PWA</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ứng dụng Progressive Web App được xây dựng với Next.js
          </p>
          <InstallButton />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Tính năng PWA</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Offline Support</CardTitle>
                <CardDescription>
                  Ứng dụng hoạt động ngay cả khi không có kết nối internet
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Installable</CardTitle>
                <CardDescription>
                  Có thể cài đặt trên thiết bị như một ứng dụng native
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Fast Loading</CardTitle>
                <CardDescription>
                  Tải nhanh nhờ service worker và caching
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Demo Components</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Button Components</CardTitle>
                <CardDescription>
                  Các variant khác nhau của button component
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => handleButtonClick("default")}>Default</Button>
                <Button variant="secondary" onClick={() => handleButtonClick("secondary")}>Secondary</Button>
                <Button variant="outline" onClick={() => handleButtonClick("outline")}>Outline</Button>
                <Button variant="ghost" onClick={() => handleButtonClick("ghost")}>Ghost</Button>
                <Button variant="destructive" onClick={() => handleButtonClick("destructive")}>Destructive</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Input</CardTitle>
                <CardDescription>
                  Input component với validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="text" placeholder="Nhập tên của bạn" />
                <Input type="email" placeholder="Nhập email" />
                <Button className="w-full">Submit</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
                <CardDescription>
                  Modal dialog component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Mở Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Demo</DialogTitle>
                      <DialogDescription>
                        Đây là một dialog component từ shadcn/ui. Bạn có thể đóng bằng cách click bên ngoài hoặc nút X.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Toast Notification</CardTitle>
                <CardDescription>
                  Toast notification component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleToastDemo}>
                  Hiển thị Toast
                </Button>
              </CardContent>
            </Card>

            <FirebaseDemo />
          </div>
        </section>
      </main>
    </div>
  );
}

