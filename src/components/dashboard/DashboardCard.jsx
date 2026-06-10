import { motion } from "framer-motion";

const VARIANT_STYLES = {
  default: "border-l-primary",
  warning: "border-l-sakura-warning",
  success: "border-l-sakura-success",
  muted: "border-l-muted-foreground/40",
};

const ICON_STYLES = {
  default: "bg-primary/10 text-primary",
  warning: "bg-sakura-warning/10 text-sakura-warning",
  success: "bg-sakura-success/10 text-sakura-success",
  muted: "bg-muted text-muted-foreground",
};

export default function DashboardCard({ title, value, icon: Icon, onClick, variant = "default" }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={title}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`bg-card rounded-2xl border border-border border-l-[3px] p-5 text-left transition-shadow duration-300 hover:shadow-md ${VARIANT_STYLES[variant]}`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ICON_STYLES[variant]}`}>
          <Icon size={22} />
        </div>
        <span className="text-3xl font-extrabold text-foreground tabular-nums tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</span>
      </div>
      <div className="mt-3 text-[13px] font-medium text-muted-foreground">{title}</div>
    </motion.button>
  );
}
