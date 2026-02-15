import { Language } from '../../types';

export interface SocialLinks {
  wechat: string;
  bilibili: string;
  music163: string;
}

export interface ContactContent {
  contactLabel: string;
  emailMeLabel: string;
  email: string;
  hello: string;
  intro: string;
  socials: SocialLinks;
  tooltip?: string;
  githubLabel: string;
  footerDesign: string;
}

export const CONTACT_DATA: Record<Language, ContactContent> = {
  zh: {
    contactLabel: "取得联系",
    emailMeLabel: "邮箱",
    email: "1293038321@qq.com",
    hello: "終於等到你<3",
    intro: "点击输入文本",
    socials: {
      wechat: "",
      bilibili: "焦糖玛奇诺",
      music163: "IVUTRITIR"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  },
  en: {
    contactLabel: "Get in touch",
    emailMeLabel: "Email Me",
    email: "1293038321@qq.com",
    hello: "Finally, I got you <3",
    intro: "Click to input text.",
    socials: {
      wechat: "",
      bilibili: "焦糖玛奇诺",
      music163: "IVUTRITIR"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  }
};
