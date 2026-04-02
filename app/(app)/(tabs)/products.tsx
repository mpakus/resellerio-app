import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button, DialogModal, InlineError, Screen, TextField } from '@/src/components/ui';
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
  const [createTabModalVisible, setCreateTabModalVisible] = useState(false);
  const [manageTabsModalVisible, setManageTabsModalVisible] = useState(false);
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
    editingTabId,
    editingTabName,
    setEditingTabName,
    startEditingTab,
    cancelEditingTab,
    isUpdatingTab,
    saveEditingTab,
    deletingTabId,
    removeProductTab,
  } = useProductsOverview(session.token);
  const activeCustomTab = productTabs.find((tab) => tab.id === filters.productTabId) ?? null;

  function closeManageTabsModal() {
    cancelEditingTab();
    setManageTabsModalVisible(false);
  }

  return (
    <Screen scrollable>
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 }}>
                INVENTORY
              </Text>
              <Text
                style={{ color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -0.8 }}
              >
                Products workspace
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 16, lineHeight: 24 }}>
                Search inventory, filter by lifecycle status, organize products with tabs, and now open
                individual product detail screens.
              </Text>
            </View>
            <View style={{ minWidth: 120 }}>
              <Button
                label="+ Add Product"
                onPress={() => {
                  router.push('/products/new');
                }}
              />
            </View>
          </View>
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                        {tab.name}
                      </Text>
                      {isActive ? (
                        <Pressable
                          accessibilityLabel={`Manage ${tab.name}`}
                          hitSlop={8}
                          onPress={(event) => {
                            event?.stopPropagation?.();
                            if (editingTabId !== tab.id) {
                              cancelEditingTab();
                            }
                            setManageTabsModalVisible(true);
                          }}
                          style={{
                            borderRadius: 999,
                            paddingHorizontal: 4,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.mutedText,
                              fontSize: 12,
                              fontWeight: '700',
                              letterSpacing: 1.2,
                            }}
                          >
                            ...
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  setCreateTabModalVisible(true);
                }}
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  + Create Tab
                </Text>
              </Pressable>
            </View>
          </ScrollView>
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
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                No matching products
              </Text>
              <Text style={{ color: colors.mutedText, fontSize: 15, lineHeight: 23, marginTop: 8 }}>
                Try a different search or clear the active filters. Product intake comes in the next
                implementation slice.
              </Text>
            </View>
          ) : null}

          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => {
                router.push(`/products/${product.id}`);
              }}
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
            </Pressable>
          ))}

          {pagination.page < pagination.total_pages ? (
            <Button label="Load more" kind="secondary" onPress={loadNextPage} />
          ) : null}
        </View>
      </View>

      <DialogModal
        visible={createTabModalVisible}
        title="Create a tab"
        description="Use tabs to group products like Shoes, Outerwear, or Bags without cluttering the main inventory screen."
        onClose={() => {
          setCreateTabModalVisible(false);
        }}
      >
        <TextField
          label="Tab name"
          placeholder="Shoes, Outerwear, Bags..."
          value={tabName}
          onChangeText={setTabName}
          onSubmitEditing={() => {
            void addProductTab().then((created) => {
              if (created) {
                setCreateTabModalVisible(false);
              }
            });
          }}
        />
        {tabError ? <InlineError message={tabError} /> : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={isCreatingTab ? 'Adding tab...' : 'Add tab'}
              disabled={isCreatingTab}
              onPress={() => {
                void addProductTab().then((created) => {
                  if (created) {
                    setCreateTabModalVisible(false);
                  }
                });
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Close"
              kind="secondary"
              onPress={() => {
                setCreateTabModalVisible(false);
              }}
            />
          </View>
        </View>
      </DialogModal>

      <DialogModal
        visible={manageTabsModalVisible}
        title={activeCustomTab ? `Manage ${activeCustomTab.name}` : 'Manage tab'}
        description={
          activeCustomTab
            ? 'Rename or remove the active product tab. Deleting it clears that assignment from products without deleting the products.'
            : 'Select a custom tab first, then use the ... action to manage it.'
        }
        onClose={closeManageTabsModal}
      >
        {activeCustomTab ? (
          <View
            style={{
              gap: 12,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: '#ffffff',
              padding: 14,
            }}
          >
            {editingTabId === activeCustomTab.id ? (
              <>
                <TextField
                  label="Tab name"
                  value={editingTabName}
                  onChangeText={setEditingTabName}
                  onSubmitEditing={() => {
                    void saveEditingTab();
                  }}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={isUpdatingTab ? 'Saving...' : 'Save'}
                      disabled={isUpdatingTab}
                      onPress={() => {
                        void saveEditingTab().then((saved) => {
                          if (saved) {
                            setManageTabsModalVisible(false);
                          }
                        });
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" kind="secondary" onPress={cancelEditingTab} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
                    {activeCustomTab.name}
                  </Text>
                  <Text style={{ color: colors.mutedText, fontSize: 13 }}>
                    Position {activeCustomTab.position}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Rename"
                      kind="secondary"
                      onPress={() => {
                        startEditingTab(activeCustomTab);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label={deletingTabId === activeCustomTab.id ? 'Deleting...' : 'Delete'}
                      kind="secondary"
                      disabled={deletingTabId === activeCustomTab.id}
                      onPress={() => {
                        void removeProductTab(activeCustomTab.id).then(() => {
                          setManageTabsModalVisible(false);
                        });
                      }}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        ) : (
          <Text style={{ color: colors.mutedText, fontSize: 15 }}>
            No active custom tab selected.
          </Text>
        )}

        {tabError ? <InlineError message={tabError} /> : null}

        <Button label="Done" kind="secondary" onPress={closeManageTabsModal} />
      </DialogModal>
    </Screen>
  );
}
