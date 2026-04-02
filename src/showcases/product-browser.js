import {
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

/**
 * Product Browser - E-commerce style product showcase with Components V2
 */
export async function setupProductBrowser(client) {
  const command = {
    name: 'products-demo',
    description: 'Browse products in an interactive catalog'
  };

  // Sample product data
  const products = [
    {
      id: 'prod_1',
      name: 'Gaming Headset Pro',
      price: 149.99,
      description: 'Professional-grade gaming headset with 7.1 surround sound, noise cancellation, and RGB lighting.',
      image: 'https://picsum.photos/seed/headset/400/300',
      category: 'Audio',
      rating: 4.8,
      stock: 25
    },
    {
      id: 'prod_2',
      name: 'Mechanical Keyboard',
      price: 199.99,
      description: 'Premium mechanical keyboard with hot-swappable switches, per-key RGB, and aircraft-grade aluminum frame.',
      image: 'https://picsum.photos/seed/keyboard/400/300',
      category: 'Peripherals',
      rating: 4.9,
      stock: 15
    },
    {
      id: 'prod_3',
      name: 'Ultrawide Monitor',
      price: 599.99,
      description: '34-inch ultrawide curved monitor with 144Hz refresh rate, HDR support, and USB-C connectivity.',
      image: 'https://picsum.photos/seed/monitor/400/300',
      category: 'Displays',
      rating: 4.7,
      stock: 8
    }
  ];

  let currentProductIndex = 0;

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === command.name) {
      await interaction.deferReply();

      const catalogMessage = buildCatalog(products, currentProductIndex);

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: catalogMessage
      });
      return;
    }

    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId === 'prev_product') {
        currentProductIndex = (currentProductIndex - 1 + products.length) % products.length;
        
        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: buildCatalog(products, currentProductIndex)
        });
        return;
      }

      if (customId === 'next_product') {
        currentProductIndex = (currentProductIndex + 1) % products.length;
        
        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: buildCatalog(products, currentProductIndex)
        });
        return;
      }

      if (customId.startsWith('buy_')) {
        const productId = customId.replace('buy_', '');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            components: [new TextDisplayBuilder().setContent('❌ Product not found.')]
          });
          return;
        }

        const confirmContainer = new ContainerBuilder()
          .setAccentColor(0x57F287)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 🛒 Confirm Purchase`),
            new TextDisplayBuilder().setContent(
              `**Product:** ${product.name}\n` +
              `**Price:** $${product.price}\n\n` +
              'Click below to complete your purchase:'
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`confirm_buy_${productId}`)
                .setLabel('Confirm Purchase')
                .setStyle(ButtonStyle.Success)
                .setEmoji('💳'),
              new ButtonBuilder()
                .setCustomId('cancel_buy')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
            )
          );

        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [confirmContainer]
        });
        return;
      }

      if (customId.startsWith('confirm_buy_')) {
        const productId = customId.replace('confirm_buy_', '');
        const product = products.find(p => p.id === productId);
        
        const successContainer = new ContainerBuilder()
          .setAccentColor(0x57F287)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## ✅ Purchase Complete!'),
            new TextDisplayBuilder().setContent(
              `Thank you for your order!\n\n` +
              `**Order Summary:**\n` +
              `• Item: ${product.name}\n` +
              `• Total: $${product.price}\n` +
              `• Estimated Delivery: 3-5 business days\n\n` +
              '> A confirmation email has been sent to your registered address.'
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('View Order Status')
                .setURL('https://example.com/orders')
                .setStyle(ButtonStyle.Link)
                .setEmoji('📦'),
              new ButtonBuilder()
                .setCustomId('continue_shopping')
                .setLabel('Continue Shopping')
                .setStyle(ButtonStyle.Primary)
            )
          );

        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: [successContainer]
        });
        return;
      }

      if (customId === 'cancel_buy' || customId === 'continue_shopping') {
        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: buildCatalog(products, currentProductIndex)
        });
        return;
      }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'category_select') {
      const selectedCategory = interaction.values[0];
      
      if (selectedCategory === 'all') {
        currentProductIndex = 0;
      } else {
        const firstMatchingIndex = products.findIndex(p => p.category === selectedCategory);
        if (firstMatchingIndex !== -1) {
          currentProductIndex = firstMatchingIndex;
        }
      }

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: buildCatalog(products, currentProductIndex)
      });
    }
  });

  return command;
}

function buildCatalog(products, currentIndex) {
  const product = products[currentIndex];
  const stars = '⭐'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');

  return [
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🛍️ Product Catalog')
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: 'https://picsum.photos/seed/shop/200/200' } })
          .setDescription('Shop logo')
      ),

    new ContainerBuilder()
      .setAccentColor(0x5865F2)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### ${product.name}`),
        new TextDisplayBuilder().setContent(
          `${product.description}\n\n` +
          `**Price:** \`$${product.price}\`\n` +
          `**Rating:** ${stars} (${product.rating}/5)\n` +
          `**Stock:** ${product.stock > 0 ? `✅ ${product.stock} available` : '❌ Out of stock'}\n` +
          `**Category:** ${product.category}`
        )
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(product.image)
            .setDescription(`${product.name} - Main image`),
          new MediaGalleryItemBuilder()
            .setURL('https://picsum.photos/seed/detail1/400/300')
            .setDescription('Detail view'),
          new MediaGalleryItemBuilder()
            .setURL('https://picsum.photos/seed/detail2/400/300')
            .setDescription('Side view')
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`buy_${product.id}`)
            .setLabel(`Buy Now - $${product.price}`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('🛒')
            .setDisabled(product.stock === 0),
          new ButtonBuilder()
            .setLabel('Add to Wishlist')
            .setCustomId('wishlist_' + product.id)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❤️')
        )
      ),

    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),

    new ContainerBuilder()
      .setAccentColor(0xEB459E)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### Browse Products'),
        new TextDisplayBuilder().setContent(`Showing ${currentIndex + 1} of ${products.length}`)
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev_product')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⬅️'),
          new ButtonBuilder()
            .setCustomId('next_product')
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('➡️')
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('category_select')
            .setPlaceholder('Filter by category...')
            .addOptions(
              { label: 'All Products', value: 'all', emoji: '📦' },
              { label: 'Audio', value: 'Audio', emoji: '🎧' },
              { label: 'Peripherals', value: 'Peripherals', emoji: '⌨️' },
              { label: 'Displays', value: 'Displays', emoji: '🖥️' }
            )
        )
      ),

    new TextDisplayBuilder().setContent(
      '> 💡 **Pro Tip:** Use the category filter to quickly find what you\'re looking for!'
    )
  ];
}
