import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, InlineError, Screen, TextField } from '@/src/components/ui';
import { useAuth } from '@/src/lib/auth/auth-provider';
import {
  productPriceLabel,
  productStatusLabel,
  productStatusOptions,
  productSubtitle,
} from '@/src/features/products/helpers';
import { useProductsOverview } from '@/src/features/products/use-products-overview';
import { colors } from '@/src/theme/colors';

export default function ProductsScreen() {
  const { session } = useAuth();
  const {
    products,
    productTabs,
    filters,
    searchDraft,
    setSearchDraft,
    pagination,
    isLoading,
    error,
    refresh,
    setStatus,
    selectProductTab,
    submitSearch,
    clearSearch,
    loadNextPage,
    tabName,
    setTabName,
    tabError,
    isCreatingTab,
    addProductTab,
  } = useProductsOverview(session.token);

  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
            INVENTORY
          </Text>
          <Text style={{ color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -0.8 }}>
            Products workspace
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
            Search inventory, filter by lifecycle status, and organize products with seller-defined
            tabs. This is the first real inventory slice on top of the authenticated app shell.
          </Text>
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
                SEARCH
              </Text>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                Find products fast
              </Text>
            </View>
            <Button label="Refresh" kind="secondary" onPress={refresh} />
          </View>

          <TextField
            label="Search title or brand"
            placeholder="Nike, denim, jacket..."
            returnKeyType="search"
            value={searchDraft}
            onChangeText={setSearchDraft}
            onSubmitEditing={submitSearch}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button label="Search" onPress={submitSearch} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Clear" kind="secondary" onPress={clearSearch} />
            </View>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
            STATUS
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {productStatusOptions.map((option) => {
                const isActive = filters.status === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setStatus(option.value);
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentSoft : colors.card,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={{ gap: 10 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
            PRODUCT TABS
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => {
                  selectProductTab(null);
                }}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: filters.productTabId === null ? colors.accent : colors.border,
                  backgroundColor: filters.productTabId === null ? colors.accentSoft : colors.card,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>All tabs</Text>
              </Pressable>
              {productTabs.map((tab) => {
                const isActive = filters.productTabId === tab.id;

                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => {
                      selectProductTab(tab.id);
                    }}
                    style={{
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: isActive ? colors.accent : colors.border,
                      backgroundColor: isActive ? colors.accentSoft : colors.card,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{tab.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View
          style={{
            gap: 14,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 18,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Create a tab</Text>
          <TextField
            label="Tab name"
            placeholder="Shoes, Outerwear, Bags..."
            value={tabName}
            onChangeText={setTabName}
            onSubmitEditing={() => {
              void addProductTab();
            }}
          />
          {tabError ? <InlineError message={tabError} /> : null}
          <Button
            label={isCreatingTab ? 'Adding tab...' : 'Add tab'}
            disabled={isCreatingTab}
            kind="secondary"
            onPress={() => {
              void addProductTab();
            }}
          />
        </View>

        {error ? <InlineError message={error} /> : null}

        <View style={{ gap: 12 }}>
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.1 }}>
            PRODUCTS
          </Text>
          <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
            {pagination.total_count} total product{pagination.total_count === 1 ? '' : 's'} · page{' '}
            {pagination.page} of {pagination.total_pages}
          </Text>

          {isLoading ? (
            <Text style={{ color: colors.mutedText, fontSize: 15 }}>Loading products...</Text>
          ) : null}

          {!isLoading && products.length === 0 ? (
            <View
              style={{
                borderRadius: 24,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 20,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>No matching products</Text>
              <Text style={{ color: colors.mutedText, fontSize: 15, lineHeight: 23, marginTop: 8 }}>
                Try a different search or clear the active filters. Product intake comes in the next
                implementation slice.
              </Text>
            </View>
          ) : null}

          {products.map((product) => (
            <View
              key={product.id}
              style={{
                gap: 10,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 18,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                    {product.title ?? 'Untitled product'}
                  </Text>
                  <Text style={{ color: colors.mutedText, fontSize: 14, lineHeight: 22 }}>
                    {productSubtitle(product) || 'No brand or category yet'}
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 999,
                    backgroundColor: colors.accentSoft,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                    {productStatusLabel(product.status)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                  {productPriceLabel(product.price)}
                </Text>
                <Text style={{ color: colors.mutedText, fontSize: 13 }}>
                  Updated {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'recently'}
                </Text>
              </View>
            </View>
          ))}

          {pagination.page < pagination.total_pages ? (
            <Button label="Load more" kind="secondary" onPress={loadNextPage} />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
