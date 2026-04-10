import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  BrandedTitle,
  Button,
  InlineError,
  LoadingScreen,
  Screen,
  SectionCard,
} from '@/src/components/ui';
import { useDashboardOverview } from '@/src/features/dashboard/use-dashboard-overview';
import { productStatusLabel, productSubtitle } from '@/src/features/products/helpers';
import { useAuth } from '@/src/lib/auth/auth-provider';
import { colors } from '@/src/theme/colors';

function AddProductQuickAction() {
  return (
    <Pressable
      accessibilityLabel="Add product"
      accessibilityRole="button"
      onPress={() => {
        router.push('/products/new');
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 58,
        borderRadius: 20,
        backgroundColor: colors.accent,
        paddingHorizontal: 18,
        transform: [{ scale: pressed ? 0.985 : 1 }],
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.24)',
        }}
      >
        <Ionicons color="#ffffff" name="camera-outline" size={18} />
      </View>
      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '800' }}>Add product</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { session } = useAuth();
  const {
    totalProducts,
    readyProducts,
    processingProducts,
    inquiries,
    recentProducts,
    isLoading,
    error,
    refresh,
  } = useDashboardOverview(session.token);

  if (isLoading) {
    return <LoadingScreen label="Loading dashboard..." />;
  }

  return (
    <Screen includeBottomInset={false} includeTopInset={false} scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            DASHBOARD
          </Text>
          <BrandedTitle title="Seller workspace" />
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Track inventory health, jump into intake, and keep an eye on recent catalog activity from one mobile home base.
          </Text>
        </View>

        <Button label="Refresh dashboard" kind="secondary" onPress={refresh} />

        {error ? <InlineError message={error} /> : null}

        <SectionCard
          eyebrow="Account"
          title={session.user.email}
          description={`Plan ${session.user.plan ?? 'free'} · ${session.user.plan_status ?? 'active'}`}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            {
              label: 'Products',
              value: totalProducts,
              description: 'Catalog records in this account.',
            },
            {
              label: 'Ready',
              value: readyProducts,
              description: 'Ready for listing or sale.',
            },
            {
              label: 'Processing',
              value: processingProducts,
              description: 'Still moving through AI workflows.',
            },
            {
              label: 'Inquiries',
              value: inquiries,
              description: 'Unread storefront lead volume.',
            },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                width: '47%',
                minWidth: 150,
                gap: 8,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 18,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
                {stat.label.toUpperCase()}
              </Text>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>{stat.value}</Text>
              <Text style={{ color: colors.mutedText, fontSize: 13, lineHeight: 20 }}>
                {stat.description}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              QUICK ACTIONS
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Jump into the next workflow
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            <AddProductQuickAction />
            <Button
              label="Products"
              kind="secondary"
              onPress={() => {
                router.push('/products');
              }}
            />
            <Button
              label="Inquiries"
              kind="secondary"
              onPress={() => {
                router.push('/inquiries');
              }}
            />
          </View>
        </View>

        <SectionCard
          eyebrow="Quota"
          title={`${session.usage.price_research}/${session.limits.price_research} price research used`}
          description={`AI drafts ${session.usage.ai_drafts}/${session.limits.ai_drafts} · Background removal ${session.usage.background_removals}/${session.limits.background_removals} · Lifestyle ${session.usage.lifestyle}/${session.limits.lifestyle}`}
        />

        <View
          style={{
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
              RECENT PRODUCTS
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Recent catalog activity
            </Text>
          </View>

          {recentProducts.length === 0 ? (
            <SectionCard
              eyebrow="Empty"
              title="No products yet"
              description="Create the first product from mobile intake to start the inventory workflow."
            />
          ) : null}

          {recentProducts.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => {
                router.push(`/products/${product.id}`);
              }}
              style={{
                gap: 6,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {product.title ?? 'Untitled product'}
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 14 }}>
                {productSubtitle(product)}
              </Text>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700' }}>
                {productStatusLabel(product.status)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
