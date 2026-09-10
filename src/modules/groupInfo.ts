/**
 * Group Information & Knowledge Base
 * Easily customizable for your educational/study community.
 */

export interface GroupConfig {
  groupName: string;
  description: string;
  schedule: string;
  resourcesLink: string;
  adminContact: string;
  rules: string[];
}

export const groupConfig: GroupConfig = {
  groupName: "ក្រុមរៀនសូត្រ & ចែករំលែកចំណេះដឹង",
  description: "សហគមន៍សម្រាប់សិស្ស-និស្សិត និងអ្នកសិក្សាទាំងអស់ ពិភាក្សា ចែករំលែកឯកសារ និងជួយដោះស្រាយលំហាត់រួមគ្នា។",
  schedule: "• ពិភាក្សាសេរី៖ រៀងរាល់ថ្ងៃ (ម៉ោង ៧:០០ ព្រឹក - ១០:០០ យប់)\n• ម៉ោងសិក្សា/ចែករំលែកប្រធានបទពិសេស៖ រៀងរាល់ចុងសប្តាហ៍ (សៅរ៍-អាទិត្យ ម៉ោង ៧:៣០ យប់)",
  resourcesLink: "https://t.me/share_knowledge_kh (ឬ Google Drive សៀវភៅ)",
  adminContact: "@admin (សូមទាក់ទងរាល់ពេលមានបញ្ហាបច្ចេកទេស)",
  rules: [
    "១. គោរពគ្នាទៅវិញទៅមក ប្រើប្រាស់ពាក្យសម្ដីសមរម្យ និងថ្លៃថ្នូរ។",
    "២. មិនអនុញ្ញាតឱ្យផ្ញើសារ Spam, Link ផ្សាយពាណិជ្ជកម្ម, ឬល្បែងស៊ីសងឡើយ។",
    "៣. ផ្តោតសំខាន់លើការរៀនសូត្រ ការស្រាវជ្រាវ និងការចែករំលែកចំណេះដឹង។",
    "៤. ហាមបង្ហោះរូបភាព ឬខ្លឹមសារមិនសមរម្យ បំពានច្បាប់ ឬប៉ះពាល់អ្នកដទៃ។",
    "៥. សមាជិកដែលល្មើសវិន័យ នឹងត្រូវទទួលបានការព្រមាន (Warn) ឬបណ្តេញចេញពីក្រុម (Kick/Ban)។",
  ],
};

/**
 * Formats group rules for the /rules command.
 */
export function formatRulesMessage(): string {
  const rulesList = groupConfig.rules.join("\n");
  return (
    `📜 *វិន័យ និងគោលការណ៍រួមរបស់ ${groupConfig.groupName}*\n\n` +
    `${rulesList}\n\n` +
    `💡 _សូមចូលរួមគោរពវិន័យទាំងអស់គ្នា ដើម្បីបរិយាកាសសិក្សាប្រកបដោយប្រសិទ្ធភាព!_`
  );
}

/**
 * Formats full group information for the /info command.
 */
export function formatGroupInfoMessage(): string {
  return (
    `🏫 *ព័ត៌មានទូទៅអំពី ${groupConfig.groupName}*\n\n` +
    `📖 *ការពិពណ៌នា:*\n${groupConfig.description}\n\n` +
    `⏰ *កាលវិភាគសិក្សា & ពិភាក្សា:*\n${groupConfig.schedule}\n\n` +
    `📚 *ឯកសារ & មេរៀន:*\n${groupConfig.resourcesLink}\n\n` +
    `👮 *ទំនាក់ទំនង Admin:*\n${groupConfig.adminContact}\n\n` +
    `ℹ️ វាយពាក្យបញ្ជា \`/rules\` ដើម្បីអានវិន័យក្រុម។`
  );
}

/**
 * Formats a welcoming message for newly joined members.
 */
export function formatWelcomeMessage(firstName: string): string {
  return (
    `👋 *សូមស្វាគមន៍មកកាន់ក្រុម ${firstName}!* 🎉\n\n` +
    `សូមស្វាគមន៍មកកាន់ *${groupConfig.groupName}*។\n` +
    `ទីនេះជាកន្លែងចែករំលែក និងរៀនសូត្ររួមគ្នា។\n\n` +
    `📌 *ការណែនាំរហ័ស:*\n` +
    `• អានវិន័យក្រុម៖ វាយពាក្យបញ្ជា \`/rules\`\n` +
    `• ព័ត៌មាន និងកាលវិភាគ៖ វាយពាក្យបញ្ជា \`/info\`\n` +
    `• សួរមេរៀន/លំហាត់ជាមួយ AI៖ គ្រាន់តែ Tag (Mention) ខ្ញុំមក \`@mykh168bot\` រួមជាមួយសំណួររបស់អ្នក!\n\n` +
    `✨ _ជូនពរការសិក្សាប្រកបដោយភាពរីករាយ និងជោគជ័យ!_`
  );
}

/**
 * Injects group context into Gemini's system prompt.
 */
export function getGroupKnowledgePrompt(): string {
  return `
[GROUP CONTEXT & KNOWLEDGE BASE]:
Group Name: ${groupConfig.groupName}
Description: ${groupConfig.description}
Study Schedule: ${groupConfig.schedule}
Resources Link: ${groupConfig.resourcesLink}
Admin Contact: ${groupConfig.adminContact}
Group Rules:
${groupConfig.rules.join("\n")}
If any member asks about group schedule, rules, resources, or admin contacts, answer accurately based on this information.
`.trim();
}
