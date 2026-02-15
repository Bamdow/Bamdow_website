import { Language, Experience, HonorsData } from '../../types';

export interface ExperimentPageContent {
  title: string;
  about: string;
  openToWork: string;
  viewHonorsLabel: string;
  honorsTitle: string;
  competitionsTitle: string;
  scholarshipsLabel: string;
  titlesLabel: string;
  experiences: Experience[];
  honors: HonorsData;
}

export const EXPERIMENT_DATA: Record<Language, ExperimentPageContent> = {
  zh: {
    title: "",
    about: "",
    openToWork: "",
    viewHonorsLabel: "",
    honorsTitle: "",
    competitionsTitle: "",
    scholarshipsLabel: "",
    titlesLabel: "",
    experiences: [],
    honors: {
      scholarships: [],
      titles: [],
      competitions: []
    }
  },
  en: {
    title: "",
    about: "",
    openToWork: "",
    viewHonorsLabel: "",
    honorsTitle: "",
    competitionsTitle: "",
    scholarshipsLabel: "",
    titlesLabel: "",
    experiences: [],
    honors: {
      scholarships: [],
      titles: [],
      competitions: []
    }
  }
};
