
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { hashPassword, SECRET_PASSWORD_HASH } from '../lib/utils';
import coupleImage from '../assets/images/couple.jpg';

const WEDDING_DATE = new Date('2026-06-06T16:00:00');

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function calculateTimeLeft(): TimeLeft {
    const difference = WEDDING_DATE.getTime() - new Date().getTime();

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    const prevValueRef = useRef(value);

    useEffect(() => {
        prevValueRef.current = value;
    }, [value]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-card shadow-lg flex items-center justify-center border border-border">
                <span className="text-2xl sm:text-3xl font-serif font-semibold text-foreground tabular-nums" suppressHydrationWarning>
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    );
}

export function HomeTab() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleHeartClick = () => {
        setShowPasswordDialog(true);
        setPassword('');
        setPasswordError('');
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hashedInput = await hashPassword(password);
        if (hashedInput === SECRET_PASSWORD_HASH) {
            localStorage.setItem('secretUnlocked', 'true');
            setShowPasswordDialog(false);
            // Trigger a page reload or state update to show the new tab
            window.location.reload();
        } else {
            setPasswordError('Incorrect password');
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-md mx-auto">
                {/* Decorative element */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="mb-6"
                >
                    <Heart className="w-8 h-8 mx-auto text-primary fill-primary/30" />
                </motion.div>

                {/* Date */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium mb-4">
                    {"We're Getting Married"}
                </motion.p>

                {/* Couple Names */}
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-6xl sm:text-7xl lg:text-8xl font-serif font-medium text-foreground mb-2 text-balance">
                    Nicole & Dave
                </motion.h1>

                {/* Wedding Date */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl sm:text-3xl font-serif text-primary mb-8">
                    06.06.26
                </motion.p>

                {/* Welcome Message */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground leading-relaxed mb-8 space-y-4 text-sm sm:text-base">
                    <p className="text-foreground">{"Finally, we're here!"}</p>
                    <p>{"We've been together for more than 7 years now, and all of you have witnessed how our relationship has grown. In so many ways, each of you has become a part of our journey—sharing in our laughter, our challenges, and our milestones."}</p>
                    <p>{"From the bottom of our hearts, we thank you for all the love, support, and prayers you've given us. It truly means so much, which is why we're incredibly excited to celebrate this special day with you."}</p>
                    <p>{"We can't wait for you to witness us exchanging our vows and our \"I do's\" in the presence of the Lord, and to enjoy this celebration that we've been lovingly preparing for almost a year."}</p>
                    <p className="text-foreground">See you on our wedding day!</p>
                </motion.div>

                {/* Couple Image */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative w-full max-w-xs mx-auto aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                    <img src={coupleImage} alt="Nicole and Dave" className="w-full h-full object-cover" />
                </motion.div>

                {/* Countdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-12">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Counting down to forever</p>
                    <div className="flex justify-center gap-3 sm:gap-4 mt-12">
                        <CountdownUnit value={timeLeft.days} label="Days" />
                        <CountdownUnit value={timeLeft.hours} label="Hours" />
                        <CountdownUnit value={timeLeft.minutes} label="Min" />
                        <CountdownUnit value={timeLeft.seconds} label="Sec" />
                    </div>
                </motion.div>

                {/* Decorative divider */}
                <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="mt-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-border" />
                    <button onClick={handleHeartClick} className="text-primary hover:text-primary/80 transition-colors" aria-label="Admin Access">
                        <Heart className="w-4 h-4" />
                    </button>
                    <div className="h-px w-12 bg-border" />
                </motion.div>
            </motion.div>

            {/* Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Admin Access</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className={passwordError ? 'border-red-500' : ''} />
                            {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Unlock</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
