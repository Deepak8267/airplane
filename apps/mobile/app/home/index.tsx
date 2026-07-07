import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Experience, Template, TemplateCategory } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { getMyExperiences } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplates } from "@/features/templates/template-service";
import { useAppTheme } from "@/stores/app-theme-store";

const COLORS = {
  primary: "#FF3D81",
  background: "#FFFFFF",
  text: "#111827",
  secondary: "#6B7280",
  border: "#F3F4F6"
};

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

type HomeCategory = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: string;
};

type HomeBanner = {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  button: string;
  image: string;
  icon: keyof typeof Ionicons.glyphMap;
  cardText: string;
  accent: string;
  orb: readonly [string, string];
  gradient: readonly [string, string];
};

const HOME_CATEGORIES: HomeCategory[] = [
  { icon: "heart", label: "Love", tone: "#fff0f6" },
  { icon: "gift", label: "Birthday", tone: "#fff7ed" },
  { icon: "people", label: "Friends", tone: "#eef4ff" },
  { icon: "sparkles", label: "Anniversary", tone: "#fff1f7" },
  { icon: "musical-notes", label: "Celebration", tone: "#f0fdf4" },
  { icon: "ellipsis-horizontal", label: "More", tone: "#f8fafc" }
];

const HOME_BANNERS: HomeBanner[] = [
  {
    id: "banner1",
    title: "Make every\nmoment",
    highlight: "unforgettable",
    subtitle: "Create beautiful interactive\nexperiences in minutes.",
    button: "Create Now",
    image: "banner1",
    icon: "heart",
    cardText: "Will you\nmarry me?",
    accent: "#FF2D78",
    orb: ["#FFD3E5", "#FF5C9A"],
    gradient: ["#FFF7FA", "#FFE8F3"]
  },
  {
    id: "banner2",
    title: "Birthday\nSurprise",
    highlight: "magic",
    subtitle: "Create memorable birthday\nmoments in minutes.",
    button: "Start Creating",
    image: "banner2",
    icon: "gift",
    cardText: "Happy\nBirthday!",
    accent: "#FF7A1A",
    orb: ["#FFE2BC", "#FF8A3D"],
    gradient: ["#FFF9F1", "#FFEAD8"]
  },
  {
    id: "banner3",
    title: "Wedding\nInvitation",
    highlight: "premium",
    subtitle: "Design elegant invitations\nand share instantly.",
    button: "Explore",
    image: "banner3",
    icon: "diamond",
    cardText: "You are\ninvited",
    accent: "#8B5CF6",
    orb: ["#E9D5FF", "#A78BFA"],
    gradient: ["#FBF8FF", "#EEE6FF"]
  },
  {
    id: "banner4",
    title: "Anniversary\nWishes",
    highlight: "memories",
    subtitle: "Celebrate your special\nstory beautifully.",
    button: "Get Started",
    image: "banner4",
    icon: "sparkles",
    cardText: "Our\nStory",
    accent: "#0EA5E9",
    orb: ["#CFFAFE", "#38BDF8"],
    gradient: ["#F5FCFF", "#DFF5FF"]
  },
  {
    id: "banner5",
    title: "Festival\nGreetings",
    highlight: "instantly",
    subtitle: "Share beautiful greeting\ncards with one link.",
    button: "Create",
    image: "banner5",
    icon: "paper-plane",
    cardText: "Best\nWishes",
    accent: "#22C55E",
    orb: ["#DCFCE7", "#4ADE80"],
    gradient: ["#FAFFF8", "#E8FBEF"]
  }
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const appTheme = useAppTheme();
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const experiencesQuery = useQuery({
    queryKey: ["my-experiences"],
    queryFn: getMyExperiences
  });
  const planUsageQuery = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getPlanUsage
  });
  const templates = templatesQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];
  const usage = planUsageQuery.data;
  const refreshing = templatesQuery.isRefetching || experiencesQuery.isRefetching || planUsageQuery.isRefetching;
  const recentExperiences = experiences.slice(0, 6);
  const isNarrow = width < 430;
  const trendingTemplates = useMemo(() => {
    const sorted = [...templates].sort((left, right) => Number(right.isPremium) - Number(left.isPremium));
    return sorted.slice(0, 8);
  }, [templates]);

  function refresh() {
    void templatesQuery.refetch();
    void experiencesQuery.refetch();
    void planUsageQuery.refetch();
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, isNarrow ? styles.contentNarrow : null]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={[styles.logoMark, { backgroundColor: appTheme.primary }]}>
              <Ionicons color="#ffffff" name="paper-plane" size={21} />
            </View>
            <View style={styles.brandCopy}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.logo, { color: appTheme.text }, isNarrow ? styles.logoNarrow : null]}>
                AIRPLANE
              </Text>
              <Text numberOfLines={1} style={[styles.tagline, { color: appTheme.secondaryText }]}>
                Create moments that fly
              </Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Link href={"/subscription" as never} asChild>
              <Pressable style={[styles.proPill, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}>
                <Ionicons color="#f59e0b" name="diamond" size={14} />
                <Text style={[styles.proText, { color: appTheme.primary }]}>{usage?.plan === "pro" ? "Pro" : "Pro"}</Text>
              </Pressable>
            </Link>
            <Pressable accessibilityLabel="Notifications" style={[styles.bellButton, { backgroundColor: appTheme.surface }]}>
              <Ionicons color={appTheme.text} name="notifications-outline" size={20} />
              <View style={[styles.notificationDot, { backgroundColor: appTheme.primary }]} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Pressable style={[styles.searchBox, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} onPress={() => router.push("/templates" as never)}>
            <Ionicons color="#9CA3AF" name="search-outline" size={17} />
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Search templates, occasions, experiences..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </Pressable>
          <Pressable accessibilityLabel="Discover templates" style={[styles.sparkleButton, { backgroundColor: appTheme.surfaceAlt, borderColor: appTheme.border }]} onPress={() => router.push("/templates" as never)}>
            <Ionicons color={appTheme.primary} name="sparkles-outline" size={20} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
          {HOME_CATEGORIES.map((category) => (
            <Pressable key={category.label} style={[styles.categoryTile, isNarrow ? styles.categoryTileNarrow : null]} onPress={() => router.push("/templates" as never)}>
              <View style={[styles.categoryIcon, { backgroundColor: appTheme.muted }]}>
                <Ionicons color={appTheme.primary} name={category.icon} size={21} />
              </View>
              <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={[styles.categoryLabel, { color: appTheme.text }]}>
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <HeroCarousel isNarrow={isNarrow} screenWidth={width} />

        <SectionHeader title="Recently Used" onSeeAll={() => router.push("/experiences" as never)} />
        {experiencesQuery.isLoading ? (
          <LoadingCard label="Loading experiences..." />
        ) : recentExperiences.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRail}>
            {recentExperiences.map((experience) => <RecentCard compact={isNarrow} experience={experience} key={experience.id} />)}
          </ScrollView>
        ) : (
          <LoadingCard label="Create your first experience to see it here." />
        )}

        <SectionHeader title="Trending Templates" onSeeAll={() => router.push("/templates" as never)} />
        {templatesQuery.isLoading ? (
          <LoadingCard label="Loading templates..." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRail}>
            {trendingTemplates.map((template, index) => (
              <TrendingCard compact={isNarrow} key={template.id} rank={index} template={template} />
            ))}
          </ScrollView>
        )}

        <Link href={"/subscription" as never} asChild>
          <Pressable style={[styles.premiumBanner, { backgroundColor: appTheme.surfaceAlt, borderColor: appTheme.border }, isNarrow ? styles.premiumBannerNarrow : null]}>
            <View style={[styles.crownBox, { backgroundColor: appTheme.surface }]}>
              <Ionicons color="#f59e0b" name="diamond" size={22} />
            </View>
            <View style={styles.premiumCopy}>
              <Text adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={[styles.premiumTitle, { color: appTheme.text }]}>
                Unlock Premium Templates
              </Text>
              <Text numberOfLines={2} style={[styles.premiumText, { color: appTheme.secondaryText }]}>
                Get access to 100+ premium templates.
              </Text>
            </View>
            <View style={[styles.upgradePill, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.upgradeText, { color: appTheme.primary }]}>
                Upgrade to Pro
              </Text>
            </View>
          </Pressable>
        </Link>
      </ScrollView>
      <BottomNav active="home" variant="main" />
    </SafeAreaView>
  );
}

function SectionHeader({ onSeeAll, title }: { onSeeAll: () => void; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </Pressable>
    </View>
  );
}

function HeroCarousel({ isNarrow, screenWidth }: { isNarrow: boolean; screenWidth: number }) {
  const bannerWidth = screenWidth - (isNarrow ? 24 : 28);
  const listRef = useRef<FlatList<HomeBanner>>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopIndexRef = useRef(1);
  const userDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorProgress = useRef(new Animated.Value(0)).current;
  const loopedBanners = useMemo<HomeBanner[]>(() => {
    const first = HOME_BANNERS[0]!;
    const last = HOME_BANNERS[HOME_BANNERS.length - 1]!;
    return [last, ...HOME_BANNERS, first];
  }, []);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const startAutoTimer = useCallback(() => {
    clearAutoTimer();
    autoTimerRef.current = setInterval(() => {
      const nextIndex = loopIndexRef.current + 1;
      loopIndexRef.current = nextIndex;
      listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    }, 4000);
  }, [clearAutoTimer]);

  const pauseAutoTimer = useCallback(() => {
    clearAutoTimer();
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, [clearAutoTimer]);

  const resumeAutoTimerSoon = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(startAutoTimer, 3000);
  }, [startAutoTimer]);

  const normalizeIndex = useCallback((index: number) => {
    if (index === 0) {
      return HOME_BANNERS.length - 1;
    }

    if (index === HOME_BANNERS.length + 1) {
      return 0;
    }

    return index - 1;
  }, []);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const rawIndex = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
      const nextActiveIndex = normalizeIndex(rawIndex);

      setActiveIndex(nextActiveIndex);
      loopIndexRef.current = rawIndex;

      if (rawIndex === 0) {
        requestAnimationFrame(() => {
          loopIndexRef.current = HOME_BANNERS.length;
          listRef.current?.scrollToIndex({ animated: false, index: HOME_BANNERS.length });
        });
      }

      if (rawIndex === HOME_BANNERS.length + 1) {
        requestAnimationFrame(() => {
          loopIndexRef.current = 1;
          listRef.current?.scrollToIndex({ animated: false, index: 1 });
        });
      }

      if (userDraggingRef.current) {
        userDraggingRef.current = false;
        resumeAutoTimerSoon();
      }
    },
    [bannerWidth, normalizeIndex, resumeAutoTimerSoon]
  );

  useEffect(() => {
    startAutoTimer();

    return () => {
      clearAutoTimer();
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [clearAutoTimer, startAutoTimer]);

  useEffect(() => {
    Animated.timing(indicatorProgress, {
      toValue: activeIndex,
      duration: 420,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false
    }).start();
  }, [activeIndex, indicatorProgress]);

  useEffect(() => {
    const nextBanner = HOME_BANNERS[(activeIndex + 1) % HOME_BANNERS.length]!;

    if (nextBanner.image.startsWith("http")) {
      void Image.prefetch(nextBanner.image);
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ animated: false, index: loopIndexRef.current });
    });
  }, [bannerWidth]);

  return (
    <View style={[styles.heroCarousel, isNarrow ? styles.heroCarouselNarrow : null, { width: bannerWidth }]}>
      <FlatList
        bounces={false}
        data={loopedBanners}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ index, length: bannerWidth, offset: bannerWidth * index })}
        horizontal
        initialNumToRender={2}
        initialScrollIndex={1}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        maxToRenderPerBatch={2}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={() => {
          userDraggingRef.current = true;
          pauseAutoTimer();
        }}
        pagingEnabled
        ref={listRef}
        removeClippedSubviews
        renderItem={({ item }) => <HeroSlide banner={item} isNarrow={isNarrow} width={bannerWidth} />}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        windowSize={3}
      />
      <View style={styles.heroIndicator}>
        {HOME_BANNERS.map((banner, index) => {
          const inputRange = HOME_BANNERS.map((_, dotIndex) => dotIndex);
          const width = indicatorProgress.interpolate({
            inputRange,
            outputRange: HOME_BANNERS.map((_, dotIndex) => (dotIndex === index ? 22 : 8)),
            extrapolate: "clamp"
          });
          const backgroundColor = indicatorProgress.interpolate({
            inputRange,
            outputRange: HOME_BANNERS.map((_, dotIndex) => (dotIndex === index ? "#FF2D78" : "#D8D8D8")),
            extrapolate: "clamp"
          });

          return <Animated.View key={banner.id} style={[styles.heroIndicatorDot, { backgroundColor, width }]} />;
        })}
      </View>
    </View>
  );
}

function HeroSlide({ banner, isNarrow, width }: { banner: HomeBanner; isNarrow: boolean; width: number }) {
  return (
    <LinearGradient colors={banner.gradient} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.heroCard, isNarrow ? styles.heroCardNarrow : null, { width }]}>
      <View style={[styles.heroGlow, styles.heroGlowLarge, { backgroundColor: banner.accent }]} />
      <View style={[styles.heroGlow, styles.heroGlowSmall]} />
      <View style={styles.heroCopy}>
        <Text style={[styles.heroTitle, isNarrow ? styles.heroTitleNarrow : null]}>{banner.title}</Text>
        <Text style={[styles.heroAccent, isNarrow ? styles.heroAccentNarrow : null, { color: banner.accent }]}>{banner.highlight}</Text>
        <Text style={[styles.heroBody, isNarrow ? styles.heroBodyNarrow : null]}>{banner.subtitle}</Text>
        <Link href={"/templates" as never} asChild>
          <Pressable style={[styles.heroButton, isNarrow ? styles.heroButtonNarrow : null, { backgroundColor: banner.accent, shadowColor: banner.accent }]}>
            <Text numberOfLines={1} style={[styles.heroButtonText, isNarrow ? styles.heroButtonTextNarrow : null]}>
              {banner.button}
            </Text>
            <View style={[styles.heroArrow, isNarrow ? styles.heroArrowNarrow : null]}>
              <Ionicons color={banner.accent} name="arrow-forward" size={16} />
            </View>
          </Pressable>
        </Link>
      </View>
      <View style={[styles.heroArt, isNarrow ? styles.heroArtNarrow : null]}>
        <LinearGradient colors={banner.orb} style={[styles.heroPinkOrb, isNarrow ? styles.heroPinkOrbNarrow : null]} />
        <View style={[styles.glassAccent, styles.glassAccentTop]} />
        <View style={[styles.glassAccent, styles.glassAccentBottom]} />
        <View style={[styles.sparkleDot, styles.sparkleDotOne, { backgroundColor: banner.accent }]} />
        <View style={[styles.sparkleDot, styles.sparkleDotTwo, { backgroundColor: banner.accent }]} />
        <Ionicons color={banner.accent} name="sparkles" size={17} style={styles.heroSparkle} />
        <View style={[styles.envelope, isNarrow ? styles.envelopeNarrow : null]}>
          <Ionicons color={banner.accent} name={banner.icon} size={24} style={styles.heroCardIcon} />
          <Text style={[styles.envelopeText, isNarrow ? styles.envelopeTextNarrow : null, { color: banner.accent }]}>{banner.cardText}</Text>
        </View>
        <Ionicons color={banner.accent} name="heart" size={24} style={styles.heroHeart} />
        <Ionicons color="#FDA4C7" name="heart" size={17} style={styles.heroSmallHeart} />
        <Ionicons color="#FFFFFF" name="paper-plane" size={19} style={styles.heroPlane} />
      </View>
    </LinearGradient>
  );
}

function RecentCard({ compact, experience }: { compact: boolean; experience: Experience }) {
  return (
    <Pressable style={[styles.templateCard, compact ? styles.templateCardNarrow : null]} onPress={() => router.push("/experiences" as never)}>
      <CardImage accent={experience.theme.accent} background={experience.theme.background} category="love" compact={compact} uri={experience.coverPhotoUrl} />
      <View style={styles.templateInfo}>
        <Text numberOfLines={1} style={styles.templateTitle}>
          {experience.title || "Untitled experience"}
        </Text>
        <Text style={styles.templateMeta}>{experience.isPublished ? "Published" : "Draft"} link</Text>
      </View>
      <Ionicons color={COLORS.secondary} name="ellipsis-vertical" size={18} style={styles.moreIcon} />
    </Pressable>
  );
}

function TrendingCard({ compact, rank, template }: { compact: boolean; rank: number; template: Template }) {
  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={[styles.templateCard, compact ? styles.templateCardNarrow : null]}>
        <CardImage accent={template.defaultTheme.accent} background={template.defaultTheme.background} category={template.category} compact={compact} uri={template.thumbnailUrl} />
        <Text style={[styles.badge, rank < 2 ? styles.popularBadge : styles.newBadge]}>{rank < 2 ? "Popular" : "New"}</Text>
        <View style={styles.templateInfo}>
          <Text numberOfLines={1} style={styles.templateTitle}>
            {template.name}
          </Text>
          <Text style={styles.templateMeta}>{getUsageLabel(rank)} uses</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function CardImage({
  accent,
  background,
  category,
  compact,
  uri
}: {
  accent: string;
  background: string;
  category: TemplateCategory | "love";
  compact: boolean;
  uri: string | null;
}) {
  if (uri) {
    return <Image resizeMode="cover" source={{ uri }} style={[styles.cardImage, compact ? styles.cardImageNarrow : null]} />;
  }

  return <VisualPanel accent={accent} background={background} category={category} compact={compact} />;
}

function VisualPanel({ accent, background, category, compact }: { accent: string; background: string; category: TemplateCategory | "love"; compact: boolean }) {
  return (
    <View style={[styles.cardImage, compact ? styles.cardImageNarrow : null, styles.visualPanel, { backgroundColor: background }]}>
      <View style={[styles.visualCircle, { backgroundColor: accent }]} />
      <Ionicons color={accent} name={getTemplateIcon(category)} size={32} />
      <View style={[styles.visualLine, { backgroundColor: accent }]} />
    </View>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <View style={styles.loadingCard}>
      <Ionicons color={COLORS.primary} name="sparkles-outline" size={18} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function getUsageLabel(index: number) {
  return ["32.1K", "28.6K", "21.3K", "18.7K", "16.4K", "14.2K", "12.8K", "9.9K"][index] ?? "8.4K";
}

function getTemplateIcon(category: TemplateCategory | "love"): keyof typeof Ionicons.glyphMap {
  if (category === "birthday") {
    return "gift";
  }

  if (category === "friends") {
    return "people";
  }

  if (category === "family") {
    return "home";
  }

  if (category === "fun") {
    return "sparkles";
  }

  return "heart";
}

const softShadow = {
  shadowColor: COLORS.text,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { gap: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 96 },
  contentNarrow: { paddingHorizontal: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  brandRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  brandCopy: { flex: 1, minWidth: 0 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-10deg" }]
  },
  logo: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 22, lineHeight: 25, letterSpacing: 0 },
  logoNarrow: { fontSize: 20, lineHeight: 23 },
  tagline: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  topActions: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 6 },
  proPill: {
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    ...softShadow
  },
  proText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 10 },
  bellButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 8, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  searchRow: { flexDirection: "row", gap: 10 },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    ...softShadow
  },
  searchInput: { flex: 1, color: COLORS.text, fontFamily: FONT.regular, fontSize: 13, padding: 0 },
  sparkleButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCE7F3",
    backgroundColor: "#FFF1F7",
    alignItems: "center",
    justifyContent: "center"
  },
  categoryRail: { gap: 10, paddingRight: 4 },
  categoryTile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 5,
    ...softShadow
  },
  categoryTileNarrow: { width: 60, height: 62 },
  categoryIcon: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  categoryLabel: { color: COLORS.text, fontFamily: FONT.medium, fontSize: 11, lineHeight: 13, textAlign: "center" },
  heroCarousel: {
    height: 188,
    borderRadius: 24,
    shadowColor: "#FF2D78",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  heroCarouselNarrow: { height: 190 },
  heroCard: {
    height: 188,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFE0EE",
    overflow: "hidden",
    paddingLeft: 24,
    paddingRight: 20,
    paddingTop: 28,
    paddingBottom: 20,
    flexDirection: "row",
    shadowColor: "#FF2D78",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  heroCardNarrow: { height: 190, paddingLeft: 18, paddingRight: 16, paddingTop: 26, paddingBottom: 20 },
  heroGlow: { position: "absolute", borderRadius: 999, opacity: 0.42 },
  heroGlowLarge: { width: 154, height: 154, right: -38, top: -22, backgroundColor: "#FFD1E4" },
  heroGlowSmall: { width: 92, height: 92, left: 84, bottom: -42, backgroundColor: "#FFFFFF" },
  heroCopy: { flex: 0.55, justifyContent: "flex-start", zIndex: 2 },
  heroTitle: { color: "#111111", fontFamily: FONT.bold, fontSize: 30, lineHeight: 34, letterSpacing: 0 },
  heroTitleNarrow: { fontSize: 20, lineHeight: 23 },
  heroAccent: { color: "#FF2D78", fontFamily: FONT.bold, fontSize: 34, lineHeight: 37, marginTop: 0 },
  heroAccentNarrow: { fontSize: 24, lineHeight: 28 },
  heroBody: { color: "#666666", fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, marginTop: 8 },
  heroBodyNarrow: { fontSize: 11, lineHeight: 16, marginTop: 6 },
  heroButton: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 170,
    height: 52,
    alignSelf: "flex-start",
    borderRadius: 26,
    backgroundColor: "#FF2D78",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 22,
    paddingRight: 8,
    shadowColor: "#FF2D78",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  heroButtonNarrow: { width: 142, height: 44, borderRadius: 22, paddingLeft: 17 },
  heroButtonText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 16, lineHeight: 21 },
  heroButtonTextNarrow: { fontSize: 13, lineHeight: 17 },
  heroArrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  heroArrowNarrow: { width: 32, height: 32, borderRadius: 16 },
  heroArt: { flex: 0.45, alignItems: "center", justifyContent: "center", minWidth: 126, zIndex: 2 },
  heroArtNarrow: { minWidth: 112 },
  heroPinkOrb: { position: "absolute", width: 136, height: 136, borderRadius: 68, opacity: 0.92 },
  heroPinkOrbNarrow: { width: 118, height: 118, borderRadius: 59 },
  glassAccent: { position: "absolute", borderWidth: 1, borderColor: "rgba(255,255,255,0.72)", backgroundColor: "rgba(255,255,255,0.42)" },
  glassAccentTop: { width: 34, height: 34, borderRadius: 17, top: 16, right: 4 },
  glassAccentBottom: { width: 22, height: 22, borderRadius: 11, bottom: 28, left: -2 },
  sparkleDot: { position: "absolute", width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FF8EBA" },
  sparkleDotOne: { top: 32, left: 4 },
  sparkleDotTwo: { right: 10, bottom: 40, opacity: 0.7 },
  heroSparkle: { position: "absolute", top: 16, left: 8 },
  envelope: {
    width: 145,
    height: 110,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
    shadowColor: "#9F1239",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5
  },
  envelopeNarrow: { width: 120, height: 92, borderRadius: 20 },
  heroCardIcon: { position: "absolute", top: 18, opacity: 0.28 },
  envelopeText: { color: "#8A123A", fontFamily: FONT.semibold, fontSize: 16, lineHeight: 23, fontStyle: "italic", textAlign: "center" },
  envelopeTextNarrow: { fontSize: 14, lineHeight: 20 },
  heroHeart: { position: "absolute", bottom: 23, left: 4 },
  heroSmallHeart: { position: "absolute", top: 30, right: 4 },
  heroPlane: { position: "absolute", top: 20, right: -4, transform: [{ rotate: "23deg" }] },
  heroIndicator: { position: "absolute", bottom: 16, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  heroIndicatorDot: { height: 8, borderRadius: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: -10 },
  sectionTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 16, lineHeight: 21 },
  seeAll: { color: COLORS.primary, fontFamily: FONT.medium, fontSize: 11 },
  cardRail: { gap: 12, paddingRight: 4 },
  templateCard: {
    width: 122,
    height: 162,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    padding: 8,
    ...softShadow
  },
  templateCardNarrow: { width: 112, height: 154 },
  cardImage: { width: "100%", height: 82, borderRadius: 18 },
  cardImageNarrow: { height: 76 },
  visualPanel: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  visualCircle: { position: "absolute", width: 86, height: 86, borderRadius: 43, opacity: 0.14 },
  visualLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  templateInfo: { gap: 2, paddingTop: 7, paddingRight: 14 },
  templateTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 18 },
  templateMeta: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 12, lineHeight: 15 },
  moreIcon: { position: "absolute", right: 8, bottom: 17 },
  badge: {
    position: "absolute",
    left: 12,
    top: 12,
    overflow: "hidden",
    borderRadius: 10,
    color: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontFamily: FONT.semibold,
    fontSize: 9
  },
  popularBadge: { backgroundColor: COLORS.primary },
  newBadge: { backgroundColor: "#22C55E" },
  premiumBanner: {
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#FFF1C2",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    overflow: "hidden"
  },
  premiumBannerNarrow: { minHeight: 82, gap: 8, paddingHorizontal: 12 },
  crownBox: { width: 34, height: 34, borderRadius: 12, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  premiumCopy: { flex: 1, minWidth: 0, gap: 3 },
  premiumTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 14, lineHeight: 18 },
  premiumText: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 12, lineHeight: 15 },
  upgradePill: {
    width: 112,
    height: 36,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FFF1F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    flexShrink: 0
  },
  upgradeText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 11 },
  loadingCard: { minHeight: 66, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", gap: 6 },
  loadingText: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 11 }
});
