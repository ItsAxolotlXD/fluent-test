import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Tv, 
  Sparkles, 
  ExternalLink,
  Clock,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { FluentPersonFeedbackIcon, FluentDeleteIcon } from '../components/FluentIcons';

interface FeedbackProps {
  navigate?: (route: string) => void;
}

interface SubmittedFeedback {
  id: string;
  category: string;
  title: string;
  description: string;
  email?: string;
  rating?: number;
  createdAt: number;
}

const CATEGORIES = [
  { id: 'suggestion', label: 'Feature Suggestion', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-500' },
  { id: 'channel', label: 'Channel / Content Request', icon: Tv, color: 'text-[#005fb8] dark:text-[#4cc2ff]' },
  { id: 'design', label: 'Design & UI/UX', icon: Sparkles, color: 'text-purple-400' },
  { id: 'other', label: 'General Feedback', icon: MessageSquare, color: 'text-emerald-500' },
];

export const Feedback: React.FC<FeedbackProps> = () => {
  const [category, setCategory] = useState<string>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedFeedbacks, setSavedFeedbacks] = useState<SubmittedFeedback[]>(() => {
    try {
      const data = localStorage.getItem('waves_user_feedbacks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('waves_user_feedbacks', JSON.stringify(savedFeedbacks));
    } catch {}
  }, [savedFeedbacks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newFeedback: SubmittedFeedback = {
        id: 'fb-' + Date.now(),
        category,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
        rating,
        createdAt: Date.now(),
      };

      setSavedFeedbacks((prev) => [newFeedback, ...prev]);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTitle('');
      setDescription('');
    }, 600);
  };

  const handleDeleteFeedback = (id: string) => {
    setSavedFeedbacks((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="feedback-page-wrapper w-full max-w-5xl mx-auto pb-28 pt-2 px-4 sm:px-6 select-none space-y-6"
    >
      {/* Top Header - Matches Settings Tab */}
      <div className="pb-3 border-none bg-transparent">
        <div className="flex items-center gap-2 mb-1.5">
          <FluentPersonFeedbackIcon className="w-4 h-4 text-[#005fb8] dark:text-[#4cc2ff]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#005fb8] dark:text-[#4cc2ff]">
            Community & Support
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white tracking-tight">
          Feedback & Góp ý
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
          Chia sẻ ý kiến đóng góp, báo cáo lỗi hoặc đề xuất kênh truyền hình mới để giúp chúng tôi hoàn thiện Sparkle
        </p>
      </div>

      <div className="flex flex-col gap-8 bg-transparent">
        {/* Section 1: Feedback Form */}
        <section className="space-y-3 bg-transparent">
          <div className="flex items-center justify-between py-1 px-1">
            <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
              Gửi phản hồi mới
            </h2>
            <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              Form tiếp nhận
            </span>
          </div>

          <div className="space-y-2.5 bg-transparent pt-0.5">
            <div className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs p-5 sm:p-6 border-none hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="feedback-success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="py-8 text-center space-y-4"
                  >
                    <div className="w-13 h-13 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111827] dark:text-white">
                      Cảm ơn bạn đã gửi phản hồi!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-md mx-auto">
                      Ý kiến của bạn đã được ghi nhận. Đội ngũ phát triển Sparkle sẽ xem xét và phản hồi trong các bản cập nhật sắp tới.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-3 inline-flex items-center gap-2 px-4 h-8 rounded-[6px] bg-[#005fb8] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs border-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Gửi thêm phản hồi khác</span>
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] dark:text-white mb-2">
                        Loại phản hồi
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={`h-8 px-3 rounded-[6px] flex items-center gap-2 text-xs transition-colors cursor-pointer border-none ${
                                isSelected
                                  ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black shadow-xs font-semibold'
                                  : 'bg-black/5 dark:bg-black/30 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white font-normal'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-black' : cat.color}`} />
                              <span>{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback Title */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] dark:text-white mb-1.5">
                        Tiêu đề <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ví dụ: Thêm kênh VTV Cần Thơ, Lỗi phát lại video..."
                        maxLength={120}
                        className="w-full h-9 px-3.5 rounded-[6px] bg-black/5 dark:bg-black/30 text-xs sm:text-sm text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#8e8e8e] outline-none transition-colors border-none"
                      />
                    </div>

                    {/* Feedback Description */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] dark:text-white mb-1.5">
                        Chi tiết phản hồi <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả chi tiết những gì bạn gặp phải, hoặc đề xuất cách cải thiện tính năng..."
                        className="w-full p-3 rounded-[6px] bg-black/5 dark:bg-black/30 text-xs sm:text-sm text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#8e8e8e] outline-none transition-colors border-none resize-y"
                      />
                    </div>

                    {/* Rating Satisfaction */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] dark:text-white mb-1.5">
                        Mức độ hài lòng với Sparkle
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`w-8 h-8 rounded-[6px] flex items-center justify-center font-bold text-sm transition-all cursor-pointer border-none ${
                              rating >= star
                                ? 'bg-amber-400 text-black shadow-xs'
                                : 'bg-black/5 dark:bg-black/30 text-[#888888] hover:bg-black/10 dark:hover:bg-black/50'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] ml-2">
                          {rating === 5 ? 'Tuyệt vời (5/5)' : rating === 4 ? 'Hài lòng (4/5)' : rating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Email (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] dark:text-white mb-1.5">
                        Email liên hệ <span className="text-[11px] font-normal text-[#6B7280] dark:text-[#9CA3AF]">(Tùy chọn)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com (để nhận thông báo cập nhật)"
                        className="w-full h-9 px-3.5 rounded-[6px] bg-black/5 dark:bg-black/30 text-xs sm:text-sm text-[#111827] dark:text-white placeholder-[#71717a] dark:placeholder-[#8e8e8e] outline-none transition-colors border-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !description.trim()}
                        className="inline-flex items-center gap-2 px-5 h-8.5 rounded-[6px] bg-[#005fb8] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black font-semibold text-xs shadow-xs transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Section 2: Góp ý gần đây của bạn (List of cards matching Settings rows) */}
        <section className="space-y-3 bg-transparent">
          <div className="flex items-center justify-between py-1 px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#005fb8] dark:text-[#4cc2ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                Góp ý gần đây của bạn ({savedFeedbacks.length})
              </h2>
            </div>
          </div>

          <div className="space-y-2.5 bg-transparent pt-0.5">
            {savedFeedbacks.length === 0 ? (
              <div className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs p-6 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF] border-none">
                Chưa có phản hồi nào được lưu trên thiết bị này.
              </div>
            ) : (
              savedFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-3.5 flex flex-col gap-2 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-normal text-sm text-[#111827] dark:text-white flex items-center gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-[6px] bg-[#0078d4]/10 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff]">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                        <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span className="font-medium text-amber-500">★ {item.rating || 5}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        title="Xóa phản hồi này"
                        className="p-1 rounded-[6px] text-[#6B7280] dark:text-[#9CA3AF] hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none"
                      >
                        <FluentDeleteIcon className="w-3.5 h-3.5 text-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section 3: Cộng đồng Sparkle (Discord Card matching Settings) */}
        <section className="space-y-3 bg-transparent">
          <div className="flex items-center gap-2 py-1 px-1">
            <ThumbsUp className="w-4 h-4 text-[#5865F2]" />
            <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
              Cộng đồng Sparkle
            </h2>
          </div>

          <div className="space-y-2.5 bg-transparent pt-0.5">
            <div className="rounded-[6px] bg-white dark:bg-[#2c3037] shadow-xs px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-[#363b43] transition-colors border-none">
              <div>
                <div className="font-normal text-sm text-[#111827] dark:text-white">
                  Tham gia máy chủ Discord
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-normal max-w-xl">
                  Bạn muốn trao đổi trực tiếp hoặc thảo luận về luồng stream TV, cập nhật lịch phát sóng? Hãy ghé thăm máy chủ Discord của chúng tôi.
                </div>
              </div>
              <a
                href="https://discord.gg/wcdjaDDayK"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 h-8 rounded-[6px] bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-xs border-none"
              >
                <span>Mở Discord</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Feedback;
