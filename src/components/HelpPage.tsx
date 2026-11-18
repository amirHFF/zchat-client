
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useLanguageStore } from "../i18n/languageStore";
import React from "react";

interface HelpSection {
    id: string;
    title: { fa: string; en: string };
    body: { fa: string; en: string };
}

const sections: HelpSection[] = [
    {
        id: "getting-started",
        title: {
            fa: "شروع کار با سیمرغ",
            en: "Getting Started with Simorgh",
        },
        body: {
            fa: "به سیمرغ خوش آمدید! سیمرغ یک محیط آموزشی هوشمند است که با هدف ایجاد تجربه‌ای تعاملی و شخصی‌سازی‌شده برای یادگیری طراحی شده است. پس از ورود به حساب کاربری، می‌توانید گفتگوی جدیدی آغاز کنید، سوالات درسی خود را مطرح کنید و از معلم هوشمند برای درک بهتر مفاهیم کمک بگیرید. هدف ما این است که یادگیری به تجربه‌ای مستمر، هدفمند و متناسب با نیازهای هر دانش‌آموز تبدیل شود.",
            en: "Welcome to Simorgh! Simorgh is an intelligent educational environment designed to provide an interactive and personalized learning experience. After signing in, you can start a new conversation, ask academic questions, and use your AI teacher to better understand different concepts. Our goal is to make learning continuous, focused, and tailored to each student's needs.",
        },
    },
    {
        id: "chat",
        title: {
            fa: "گفتگو با معلم هوشمند",
            en: "Chat with Your AI Teacher",
        },
        body: {
            fa: "گفتگو یکی از اصلی‌ترین روش‌های یادگیری در سیمرغ است. می‌توانید سوالات خود را به زبان طبیعی مطرح کنید، درباره مفاهیم درسی توضیح بیشتری بخواهید، مثال‌های آموزشی دریافت کنید و موضوعات پیچیده را مرحله‌به‌مرحله یاد بگیرید. معلم هوشمند تلاش می‌کند به جای ارائه صرفاً یک پاسخ، به شما در درک عمیق‌تر موضوع کمک کند. همچنین می‌توانید گفتگوهای مختلف خود را مدیریت کرده و در ادامه به مباحث قبلی بازگردید.",
            en: "Conversation is one of the main learning methods on Simorgh. You can ask questions in natural language, request further explanations, receive educational examples, and explore complex topics step by step. Your AI teacher aims to help you understand concepts deeply rather than simply providing answers. You can also manage different conversations and return to previous discussions.",
        },
    },
    // {
    //     id: "personalized-learning",
    //     title: {
    //         fa: "آموزش شخصی‌سازی‌شده",
    //         en: "Personalized Learning",
    //     },
    //     body: {
    //         fa: "هر دانش‌آموز روش، سرعت و نیازهای یادگیری متفاوتی دارد. در سیمرغ تلاش می‌کنیم فرآیند آموزش را متناسب با نیازهای هر فرد ارائه کنیم. هوش مصنوعی می‌تواند در توضیح مفاهیم، ارائه مثال‌های متنوع، مقایسه موضوعات و پاسخ به سوالات آموزشی به شما کمک کند. هدف این رویکرد، عبور از آموزش یکسان برای همه و حرکت به سمت تجربه‌ای است که با سطح دانش، نیازها و مسیر یادگیری هر دانش‌آموز هماهنگ باشد.",
    //         en: "Every student has a different learning style, pace, and set of needs. Simorgh aims to adapt the learning experience to each individual. AI can help explain concepts, provide different examples, compare topics, and answer educational questions. The goal is to move beyond one-size-fits-all education and create a learning experience aligned with each student's knowledge, needs, and learning journey.",
    //     },
    // },
    {
        id: "teacher-interaction",
        title: {
            fa: "تعامل با معلم و ارتقای کیفیت آموزش",
            en: "Teacher Interaction & Educational Quality",
        },
        body: {
            fa: "هوش مصنوعی به تنهایی جایگزین نقش ارزشمند معلم نیست. در سیمرغ، تعامل میان دانش‌آموز و معلم یکی از ارکان اصلی سیستم است. معلم می‌تواند با بررسی روند آموزشی، عملکرد دانش‌آموزان و ارائه بازخورد، به بهبود کیفیت آموزش کمک کند. همچنین بازخوردهای معلمان به ما کمک می‌کند تا تجربه آموزشی و عملکرد سامانه را به شکل مستمر ارتقا دهیم. هدف ما ایجاد همکاری مؤثر میان دانش‌آموز، معلم و هوش مصنوعی است.",
            en: "Artificial intelligence alone cannot replace the valuable role of a teacher. At Simorgh, interaction between students and teachers is one of the core pillars of the platform. Teachers can help improve educational quality by reviewing learning activities, evaluating student performance, and providing feedback. Teacher feedback also helps us continuously improve the platform and its educational experience. Our goal is to create effective collaboration between students, teachers, and AI.",
        },
    },
    {
        id: "assessment",
        title: {
            fa: "ارزیابی و پیشرفت تحصیلی",
            en: "Assessment & Learning Progress",
        },
        body: {
            fa: "یادگیری مؤثر تنها به دریافت پاسخ سوالات محدود نمی‌شود؛ بلکه شناخت میزان یادگیری و تلاش مستمر نیز اهمیت دارد. در رویکرد آموزشی سیمرغ، ارزیابی یادگیری دانش‌آموز و بازخورد معلم در کنار تعاملات آموزشی اهمیت دارند. هدف از این فرآیند، شناسایی نقاط قوت و زمینه‌های نیازمند تقویت و کمک به پیشرفت واقعی دانش‌آموز است.",
            en: "Effective learning is not limited to receiving answers; understanding progress and maintaining consistent effort are equally important. In Simorgh's educational approach, student assessment and teacher feedback complement daily learning interactions. This process aims to identify strengths, areas for improvement, and support meaningful academic progress.",
        },
    },
    {
        id: "account",
        title: {
            fa: "حساب کاربری و تنظیمات",
            en: "Account & Settings",
        },
        body: {
            fa: "از بخش تنظیمات می‌توانید تنظیمات مربوط به حساب کاربری و محیط برنامه را مدیریت کنید. همچنین امکان تغییر زبان رابط کاربری و استفاده از تنظیمات ظاهری سامانه، متناسب با امکانات فعال‌شده برای حساب شما، وجود دارد. برای حفظ امنیت حساب خود، اطلاعات ورودتان را در اختیار دیگران قرار ندهید.",
            en: "From the settings section, you can manage your account and application preferences. You can also change the interface language and customize the platform's appearance according to the features available to your account. For your account's security, never share your login credentials with others.",
        },
    },
    {
        id: "contact",
        title: {
            fa: "ارتباط با پشتیبانی",
            en: "Contact Support",
        },
        body: {
            fa: "اگر در استفاده از سیمرغ با مشکلی مواجه شدید یا پیشنهاد و انتقادی برای بهبود تجربه آموزشی دارید، می‌توانید از طریق راه‌های ارتباطی پشتیبانی با تیم ما در تماس باشید. نظرات و پیشنهادهای شما به ما کمک می‌کند تا کیفیت خدمات و تجربه یادگیری را بهبود دهیم.",
            en: "If you experience any issues while using Simorgh or have suggestions for improving the learning experience, you can contact our support team through the available support channels. Your feedback helps us improve our services and the overall learning experience.",
        },
    },
];

export default function HelpPage() {
    const navigate = useNavigate();
    const locale = useLanguageStore((state) => state.locale);
    const isFa = locale === "fa";

    return (
        <Box
            sx={{
                maxWidth: 720,
                mx: "auto",
                p: { xs: 2, sm: 3 },
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                boxSizing: "border-box",
                WebkitOverflowScrolling: "touch",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <IconButton
                    onClick={() => navigate(-1)}
                    aria-label={isFa ? "بازگشت" : "Back"}
                    sx={{ color: "var(--navy)" }}
                >
                    {isFa ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                </IconButton>

                <Typography
                    sx={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 20,
                        color: "var(--navy)",
                    }}
                >
                    {isFa ? "راهنمای سیمرغ" : "Simorgh Help"}
                </Typography>
            </Box>

            <Typography
                sx={{
                    fontSize: 13.5,
                    color: "var(--navy)",
                    opacity: 0.75,
                    mb: 2,
                    lineHeight: 1.9,
                }}
            >
                {isFa
                    ? "سیمرغ با ترکیب هوش مصنوعی و تعامل انسانی، به دنبال ایجاد تجربه‌ای متفاوت در آموزش است. دو محور اصلی ما، شخصی‌سازی مسیر یادگیری و همکاری با معلم برای ارتقای کیفیت آموزش هستند."
                    : "Simorgh combines artificial intelligence with human interaction to create a different learning experience. Our two main pillars are personalized learning and teacher collaboration to improve educational quality."}
            </Typography>

            <Box
                sx={{
                    mb: 2.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "var(--surface)",
                    border: "1px solid var(--line)",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--navy)",
                        mb: 1,
                    }}
                >
                    {isFa
                        ? "دو محور اصلی سیمرغ"
                        : "The Two Main Pillars of Simorgh"}
                </Typography>

                <Typography
                    sx={{
                        fontSize: 13,
                        color: "var(--navy)",
                        lineHeight: 2,
                    }}
                >
                    {isFa
                        ? "۱. آموزش شخصی‌سازی‌شده: یادگیری متناسب با نیازها و مسیر آموزشی هر دانش‌آموز.\n۲. تعامل با معلم: همکاری دانش‌آموز، معلم و هوش مصنوعی برای بهبود کیفیت آموزش."
                        : "1. Personalized Learning: Education tailored to each student's needs and learning journey.\n2. Teacher Interaction: Collaboration between students, teachers, and AI to improve educational quality."}
                </Typography>
            </Box>

            {sections.map((s) => (
                <Accordion
                    key={s.id}
                    disableGutters
                    elevation={0}
                    sx={{
                        mb: 1,
                        borderRadius: "12px !important",
                        bgcolor: "var(--surface)",
                        border: "1px solid var(--line)",
                        "&::before": { display: "none" },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: "var(--teal)" }} />}
                    >
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--navy)",
                            }}
                        >
                            {s.title[locale]}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Typography
                            sx={{
                                fontSize: 13.5,
                                color: "var(--navy)",
                                lineHeight: 2,
                                whiteSpace: "pre-line",
                            }}
                        >
                            {s.body[locale]}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
