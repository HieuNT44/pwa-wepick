"use client";

import { LoginRequiredModal } from "@/components/login-required-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import usersData from "@/data/users-example.json";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { setIsMatchActive } from "@/lib/utils/local-storage";
import { completeMatch } from "@/lib/utils/match-complete";
import type { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CreateMatchModalProps {
  open: boolean;
  onClose: () => void;
}

type MatchType = "Đơn" | "Đôi" | null;
type Step = 1 | 2 | 3;

export function CreateMatchModal({ open, onClose }: CreateMatchModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [matchType, setMatchType] = useState<MatchType>(null);
  const [team1, setTeam1] = useState<string[]>([]);
  const [team2, setTeam2] = useState<string[]>([]);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<{
    team: 1 | 2;
    slot: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = () => {
    try {
      setLoading(true);
      // Load directly from JSON file
      const users = Array.isArray(usersData) ? usersData : [];
      setUsers(users as User[]);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 1) {
      onClose();
    } else {
      // Show confirmation if in step 2 or 3
      if (confirm("Bạn có chắc muốn đóng? Dữ liệu sẽ bị mất.")) {
        resetForm();
        onClose();
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setMatchType(null);
    setTeam1([]);
    setTeam2([]);
    setScore1("");
    setScore2("");
  };

  const handleNextStep1 = () => {
    if (matchType) {
      setStep(2);
    }
  };

  const handleBackStep2 = () => {
    setStep(1);
  };

  const handleNextStep2 = () => {
    const requiredPlayers = matchType === "Đơn" ? 2 : 4;
    if (team1.length + team2.length === requiredPlayers) {
      setStep(3);
    } else {
      toast({
        title: "Thiếu người chơi",
        description: `Vui lòng chọn đủ ${requiredPlayers} người chơi`,
        variant: "destructive",
      });
    }
  };

  const togglePlayer = (userName: string, team: 1 | 2) => {
    if (team === 1) {
      if (team1.includes(userName)) {
        setTeam1(team1.filter((name) => name !== userName));
      } else {
        const maxPlayers = matchType === "Đơn" ? 1 : 2;
        if (team1.length < maxPlayers && !team2.includes(userName)) {
          setTeam1([...team1, userName]);
        }
      }
    } else {
      if (team2.includes(userName)) {
        setTeam2(team2.filter((name) => name !== userName));
      } else {
        const maxPlayers = matchType === "Đơn" ? 1 : 2;
        if (team2.length < maxPlayers && !team1.includes(userName)) {
          setTeam2([...team2, userName]);
        }
      }
    }
  };

  const handleComplete = async () => {
    // Check auth before completing match
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!matchType || !score1.trim() || !score2.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ tỷ số",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const startTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    try {
      // Format score as "score1-score2"
      const score = `${score1.trim()}-${score2.trim()}`;

      console.log("🎯 Completing match...");
      console.log("   Match type:", matchType);
      console.log("   Team 1:", team1);
      console.log("   Team 2:", team2);
      console.log("   Score:", score);
      console.log("   Start time:", startTime);

      await completeMatch({
        matchType,
        team1,
        team2,
        score,
        startTime,
      });

      console.log("✅ Match completed successfully");

      toast({
        title: "Thành công",
        description: "Đã tạo trận đấu mới",
      });

      resetForm();
      onClose();
      router.push("/match");
    } catch (error) {
      console.error("❌ Error completing match:", error);
      if (error instanceof Error) {
        console.error("   Error message:", error.message);
        console.error("   Error code:", (error as { code?: string }).code);
      }
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo trận đấu",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (confirm("Bạn có chắc muốn huỷ trận đấu?")) {
      setIsMatchActive(false);
      resetForm();
      onClose();
      router.push("/match");
    }
  };

  const getPlayerNickname = (name: string) => {
    return users.find((u) => u.name === name)?.nickname || name;
  };

  const getPlayerInitial = (name: string) => {
    return users.find((u) => u.name === name)?.nickname?.charAt(0) || "?";
  };

  const getPlayerAvatar = (name: string) => {
    // Placeholder for actual avatar images
    const user = users.find((u) => u.name === name);
    if (user?.id === "01")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuA162IYAu4JP4MskjyAPhqUEIU_Suae80IDfcD2VFnIcnNFG7dF4qdSMu0DY_itWkXU7Le_5usUPBYTtLQfsckwKSYyHy0RIO0h8IalYeMaEscVjUj2Y7Opo8X9RWxF1BAIiYDkFFUGwGYv9VweHYgTeMrVRWiCzfvppIAsG3gZvkvYvz4-7xQOijKijgPUdQ1a5Pahtev-0yhQgW5Cd7pzeWHRPM1QzWUSi6zuMR5MQTmLXHpjfhYL-nBx-Nf_qj49fQ_3gkoPzA";
    if (user?.id === "02")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuDKmsweucrV0uMWKfi2cB4Tn1Ey9QXKodc-qHLIj1_SKJfI1Tf1C3jqFoLT72ID2jsOZ4plPavWM17tKpCWFXue2id1OyW_O8kfoSQxIfKNyB8hgLpwhhDH9q39MReivghsaQJpambf9xsc4worMrE5iNWyxYNQHsJJDwB0fUjX3AWAXff0T3XriG6e_3aFW-qBP0PMEkesDzI2shdhMExU9BIezuSvpIvBYer2sXFhmzmBqXlxQKXf_hyV76XeFsk0A99RlQ321w";
    if (user?.id === "03")
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuClmF4CX3ENVbKcoK8j1snk80Xq9iGRRXzv016p70VLtzJEMYFEmyw10ZRQg3drNoGqhOCrCRHveEAts_3hCdRRBAZLuml7TLbqmKtP9jI63UNUtIyko8bg90PL9-MU83LUdcwR8iv1DofoWHjBhJa13wxpD7-DYY0N6brde6jWQFvhP1bjnaVk3umjC0IypdfFx-X1byohLMvdbA3b0IUuHa4HvthBoPutsMRpijY7wsEH55xaJAH1NARJpoMbW0ciCecmLsWhog";
    return ""; // Default empty string or a generic avatar
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white max-w-[600px] mx-auto shadow-xl flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)))}
              className="size-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-text-main">
                arrow_back_ios_new
              </span>
            </button>
          ) : (
            <div className="w-10"></div>
          )}
          <div className="text-center">
            <h1 className="text-text-main text-lg font-bold">
              {step === 1
                ? "Tạo Trận Đấu Mới"
                : step === 2
                ? "Chọn Người Chơi"
                : "Nhập Kết Quả"}
            </h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">
              Bước {step}/3
            </p>
          </div>
          <button
            onClick={handleClose}
            className="size-10 flex items-center justify-center rounded-full active:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-text-main">
              close
            </span>
          </button>
        </div>
        <div className="mt-4 flex gap-1 h-1 w-full">
          <div
            className={`flex-1 rounded-full transition-all ${
              step >= 1 ? "bg-primary" : "bg-gray-100"
            }`}
          ></div>
          <div
            className={`flex-1 rounded-full transition-all ${
              step >= 2 ? "bg-primary" : "bg-gray-100"
            }`}
          ></div>
          <div
            className={`flex-1 rounded-full transition-all ${
              step >= 3 ? "bg-primary" : "bg-gray-100"
            }`}
          ></div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto min-h-0">
        {/* Step 1: Match Type Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold text-text-main mb-1">
              Chọn loại trận đấu
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Bạn muốn chơi đánh đơn hay đánh đôi?
            </p>

            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary/50 active:scale-[0.98] ${
                  matchType === "Đơn"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="matchType"
                  value="Đơn"
                  checked={matchType === "Đơn"}
                  onChange={() => setMatchType("Đơn")}
                  className="size-5 text-primary border-gray-300 focus:ring-primary"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                      matchType === "Đơn"
                        ? "bg-primary text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main">ĐƠN (1 vs 1)</h3>
                    <p className="text-xs text-text-secondary">
                      Trận đấu đối kháng cá nhân
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary/50 active:scale-[0.98] ${
                  matchType === "Đôi"
                    ? "border-primary bg-primary/5"
                    : "border-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="matchType"
                  value="Đôi"
                  checked={matchType === "Đôi"}
                  onChange={() => setMatchType("Đôi")}
                  className="size-5 text-primary border-gray-300 focus:ring-primary"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`size-12 rounded-xl flex items-center justify-center transition-colors ${
                      matchType === "Đôi"
                        ? "bg-primary text-white"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span className="material-symbols-outlined">groups</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main">ĐÔI (2 vs 2)</h3>
                    <p className="text-xs text-text-secondary">
                      Trận đấu phối hợp đồng đội
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Player Selection */}
        {step === 2 && (
          <div>
            {loading ? (
              <div className="text-center py-8 h-screen">
                <p className="text-text-secondary">Đang tải danh sách...</p>
              </div>
            ) : (
              <>
                {/* Team A */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-text-main flex items-center gap-2">
                      <span className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        A
                      </span>
                      Đội A
                    </h2>
                    <span className="text-xs font-medium text-text-secondary">
                      {matchType === "Đơn" ? "Đánh đơn" : "Đánh đôi"}
                    </span>
                  </div>
                  <div className="flex justify-center gap-8">
                    {/* Slot 1 */}
                    {team1[0] ? (
                      <button
                        onClick={() => {
                          const newTeam1 = [...team1];
                          newTeam1.splice(0, 1);
                          setTeam1(newTeam1);
                        }}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="size-24 rounded-full flex items-center justify-center bg-gray-50 border-2 border-gray-100 relative overflow-hidden active:scale-95 transition-transform">
                          <div className="size-full rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">
                              {users
                                .find((u) => u.name === team1[0])
                                ?.nickname?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">
                              edit
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-text-main">
                          {users.find((u) => u.name === team1[0])?.nickname ||
                            team1[0]}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectingSlot({ team: 1, slot: 0 })}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="size-24 rounded-full flex items-center justify-center bg-primary/5 border-2 border-primary border-dashed relative overflow-hidden active:scale-95 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">
                            person_add
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          Chọn người chơi
                        </span>
                      </button>
                    )}

                    {/* Slot 2 (only for Đôi) */}
                    {matchType === "Đôi" && (
                      <>
                        {team1[1] ? (
                          <button
                            onClick={() =>
                              setSelectingSlot({ team: 1, slot: 1 })
                            }
                            className="group flex flex-col items-center gap-3"
                          >
                            <div className="size-24 rounded-full flex items-center justify-center bg-gray-50 border-2 border-gray-100 relative overflow-hidden active:scale-95 transition-transform">
                              <div className="size-full rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold text-lg">
                                  {users
                                    .find((u) => u.name === team1[1])
                                    ?.nickname?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">
                                  edit
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-text-main">
                              {users.find((u) => u.name === team1[1])
                                ?.nickname || team1[1]}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectingSlot({ team: 1, slot: 1 })
                            }
                            className="group flex flex-col items-center gap-3"
                          >
                            <div className="size-24 rounded-full flex items-center justify-center bg-primary/5 border-2 border-primary border-dashed relative overflow-hidden active:scale-95 transition-transform">
                              <span className="material-symbols-outlined text-primary text-3xl">
                                person_add
                              </span>
                            </div>
                            <span className="text-xs font-bold text-primary">
                              Chọn người chơi
                            </span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </section>

                {/* VS Divider */}
                <div className="flex items-center gap-4 mb-12">
                  <div className="flex-1 h-px bg-gray-100"></div>
                  <div className="text-gray-300 font-black italic tracking-widest text-lg">
                    VS
                  </div>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                {/* Team B */}
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-text-main flex items-center gap-2">
                      <span className="size-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-sm font-bold">
                        B
                      </span>
                      Đội B
                    </h2>
                    <span className="text-xs font-medium text-text-secondary">
                      {matchType === "Đơn" ? "Đánh đơn" : "Đánh đôi"}
                    </span>
                  </div>
                  <div className="flex justify-center gap-8">
                    {/* Slot 1 */}
                    {team2[0] ? (
                      <button
                        onClick={() => setSelectingSlot({ team: 2, slot: 0 })}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="size-24 rounded-full flex items-center justify-center bg-gray-50 border-2 border-gray-100 relative overflow-hidden active:scale-95 transition-transform">
                          <div className="size-full rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-lg">
                              {users
                                .find((u) => u.name === team2[0])
                                ?.nickname?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">
                              edit
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-text-main">
                          {users.find((u) => u.name === team2[0])?.nickname ||
                            team2[0]}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectingSlot({ team: 2, slot: 0 })}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="size-24 rounded-full flex items-center justify-center bg-primary/5 border-2 border-primary border-dashed relative overflow-hidden active:scale-95 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">
                            person_add
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          Chọn người chơi
                        </span>
                      </button>
                    )}

                    {/* Slot 2 (only for Đôi) */}
                    {matchType === "Đôi" && (
                      <>
                        {team2[1] ? (
                          <button
                            onClick={() =>
                              setSelectingSlot({ team: 2, slot: 1 })
                            }
                            className="group flex flex-col items-center gap-3"
                          >
                            <div className="size-24 rounded-full flex items-center justify-center bg-gray-50 border-2 border-gray-100 relative overflow-hidden active:scale-95 transition-transform">
                              <div className="size-full rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary font-bold text-lg">
                                  {users
                                    .find((u) => u.name === team2[1])
                                    ?.nickname?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">
                                  edit
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-text-main">
                              {users.find((u) => u.name === team2[1])
                                ?.nickname || team2[1]}
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectingSlot({ team: 2, slot: 1 })
                            }
                            className="group flex flex-col items-center gap-3"
                          >
                            <div className="size-24 rounded-full flex items-center justify-center bg-primary/5 border-2 border-primary border-dashed relative overflow-hidden active:scale-95 transition-transform">
                              <span className="material-symbols-outlined text-primary text-3xl">
                                person_add
                              </span>
                            </div>
                            <span className="text-xs font-bold text-primary">
                              Chọn người chơi
                            </span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* Step 3: Score Input */}
        {step === 3 && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-8 text-center">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                Bước 3: Kết thúc trận
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-text-main">
                Ai đã giành chiến thắng?
              </h2>
            </div>

            <div className="w-full space-y-8 mt-4">
              {/* Team 1 Score Input */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex -space-x-3 flex-1 justify-end">
                    {team1.map((name, index) => {
                      const user = users.find((u) => u.name === name);
                      const avatar = getPlayerAvatar(name);
                      return avatar ? (
                        <img
                          key={index}
                          alt="Player"
                          className="size-12 rounded-full border-2 border-white shadow-md object-cover"
                          src={avatar}
                        />
                      ) : (
                        <div
                          key={index}
                          className="size-12 rounded-full border-2 border-white bg-gray-50 shadow-md flex items-center justify-center"
                        >
                          <span className="text-primary font-bold text-sm">
                            {getPlayerInitial(name)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-24 shrink-0">
                    <input
                      className="score-input w-full h-20 text-center text-4xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl text-text-main"
                      placeholder="0"
                      type="number"
                      value={score1}
                      onChange={(e) => setScore1(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-main">
                      {team1.map((name) => getPlayerNickname(name)).join(" & ")}
                    </p>
                    <p className="text-[10px] text-text-secondary uppercase">
                      Đội 1
                    </p>
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-gray-200"></div>
                </div>
                <div className="relative bg-white px-4">
                  <span className="text-xs font-black text-gray-300 tracking-tighter italic">
                    VERSUS
                  </span>
                </div>
              </div>

              {/* Team 2 Score Input */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex -space-x-3 flex-1 justify-end">
                    {team2.map((name, index) => {
                      const user = users.find((u) => u.name === name);
                      const avatar = getPlayerAvatar(name);
                      const isWinner =
                        score2.trim() &&
                        score1.trim() &&
                        parseInt(score2) > parseInt(score1);
                      return avatar ? (
                        <img
                          key={index}
                          alt="Player"
                          className={`size-12 rounded-full border-2 shadow-md object-cover ${
                            isWinner ? "border-primary/20" : "border-white"
                          }`}
                          src={avatar}
                        />
                      ) : (
                        <div
                          key={index}
                          className={`size-12 rounded-full border-2 shadow-md flex items-center justify-center ${
                            isWinner
                              ? "border-primary/20 bg-primary/5"
                              : "border-white bg-gray-50"
                          }`}
                        >
                          <span
                            className={`font-bold text-sm ${
                              isWinner ? "text-primary" : "text-primary"
                            }`}
                          >
                            {getPlayerInitial(name)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-24 shrink-0">
                    <input
                      className={`score-input w-full h-20 text-center text-4xl font-black border-2 rounded-2xl ${
                        score2.trim() &&
                        score1.trim() &&
                        parseInt(score2) > parseInt(score1)
                          ? "bg-primary/5 border-primary text-primary"
                          : "bg-gray-50 border-gray-100 text-text-main"
                      }`}
                      placeholder="0"
                      type="number"
                      value={score2}
                      onChange={(e) => setScore2(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-bold ${
                        score2.trim() &&
                        score1.trim() &&
                        parseInt(score2) > parseInt(score1)
                          ? "text-primary"
                          : "text-text-main"
                      }`}
                    >
                      {team2.map((name) => getPlayerNickname(name)).join(" & ")}
                    </p>
                    <p
                      className={`text-[10px] uppercase ${
                        score2.trim() &&
                        score1.trim() &&
                        parseInt(score2) > parseInt(score1)
                          ? "text-primary/70"
                          : "text-text-secondary"
                      }`}
                    >
                      Đội 2
                      {score2.trim() &&
                        score1.trim() &&
                        parseInt(score2) > parseInt(score1) &&
                        " (Winner)"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[600px] mx-auto p-6 bg-white border-t border-gray-50">
        {step === 1 && (
          <Button
            onClick={handleNextStep1}
            disabled={!matchType}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center relative px-6 py-3 shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            <span>Tiếp theo</span>
            <span className="material-symbols-outlined text-sm absolute right-6">
              arrow_forward_ios
            </span>
          </Button>
        )}

        {step === 2 && (
          <div className="flex gap-3">
            <Button
              onClick={handleBackStep2}
              variant="outline"
              className="flex-1 py-4 rounded-2xl font-bold"
            >
              Quay lại
            </Button>
            <Button
              onClick={handleNextStep2}
              disabled={
                team1.length + team2.length !== (matchType === "Đơn" ? 2 : 4)
              }
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              Tiếp theo
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <Button
              onClick={handleComplete}
              disabled={!score1.trim() || !score2.trim()}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Đồng ý
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full bg-white border-2 border-gray-200 text-text-secondary py-4 rounded-2xl font-bold text-sm active:bg-gray-50 transition-colors"
            >
              Huỷ trận đấu
            </Button>
          </div>
        )}
      </footer>

      {/* Player Selection Dialog */}
      <Dialog
        open={selectingSlot !== null}
        onOpenChange={(open) => !open && setSelectingSlot(null)}
      >
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chọn người chơi</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {users
              .filter((user) => {
                // Don't show users already in the other team
                if (selectingSlot?.team === 1) {
                  return !team2.includes(user.name);
                } else {
                  return !team1.includes(user.name);
                }
              })
              .map((user) => {
                const isSelected =
                  (selectingSlot?.team === 1 &&
                    team1[selectingSlot.slot] === user.name) ||
                  (selectingSlot?.team === 2 &&
                    team2[selectingSlot.slot] === user.name);

                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (!selectingSlot) return;
                      const { team, slot } = selectingSlot;
                      if (team === 1) {
                        const newTeam1 = [...team1];
                        // Remove from team2 if exists
                        if (team2.includes(user.name)) {
                          setTeam2(team2.filter((n) => n !== user.name));
                        }
                        newTeam1[slot] = user.name;
                        setTeam1(newTeam1.filter(Boolean));
                      } else {
                        const newTeam2 = [...team2];
                        // Remove from team1 if exists
                        if (team1.includes(user.name)) {
                          setTeam1(team1.filter((n) => n !== user.name));
                        }
                        newTeam2[slot] = user.name;
                        setTeam2(newTeam2.filter(Boolean));
                      }
                      setSelectingSlot(null);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {user.nickname?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-main">
                          {user.nickname}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {user.name}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary">
                          check_circle
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Required Modal */}
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
