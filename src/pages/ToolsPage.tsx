import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ToolsPage: React.FC = () => {
  // Function to get icon for each tool category/type
  const getToolIcon = (title: string, category: string) => {
    const iconClass = "w-12 h-12 text-[#1a1a1a] drop-shadow-md";
    
    if (title.includes('Presentation')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V7h14v12zM8 8h8v2H8V8zm0 3h8v2H8v-2zm0 3h5v2H8v-2z"/>
        </svg>
      );
    }
    if (title.includes('Summarizer')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
        </svg>
      );
    }
    if (title.includes('Converter') || title.includes('Convert')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }
    if (title.includes('Chatbot') || title.includes('AI') || title.includes('Agent')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm7 7c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm1.5-7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('Planner') || title.includes('Productivity')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      );
    }
    if (title.includes('Image') || title.includes('Resizer')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      );
    }
    if (title.includes('Video') || title.includes('Trimmer')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      );
    }
    if (title.includes('Audio') || title.includes('Transcriber')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c0 3-2.54 5.1-5.3 5.1S6.7 11 6.7 8H5c0 3.41 2.72 6.23 6 6.72V17h-2v2h6v-2h-2v-2.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
        </svg>
      );
    }
    if (title.includes('Data') || title.includes('Analysis')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.25l1.25-1.25-2.75-2.75-1.25 1.25L15 17.5l2.5 2.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      );
    }
    if (title.includes('Color') || title.includes('Picker')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('PDF')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      );
    }
    if (title.includes('DOC') || title.includes('Document')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5.5-7c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-2v-5h2zm0 4v-2h-1v2h1z"/>
        </svg>
      );
    }
    if (title.includes('Compressor') || title.includes('File')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2.18l.45-1.35c.1-.32-.1-.65-.45-.65C17.4 4 17 4.4 17 4.82L16.46 6H15c-.55 0-1 .45-1 1s.45 1 1 1h1.18L15.73 9H14c-.55 0-1 .45-1 1s.45 1 1 1h1.46l-.45 1.35c-.1.32.1.65.45.65.42 0 .82-.4.82-.82L16.73 11H18c.55 0 1-.45 1-1s-.45-1-1-1h-1.18L18.27 8H20c.55 0 1-.45 1-1s-.45-1-1-1zM10 4H8l-4 4v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 12H6v-2h4v2zm4-4H6v-2h8v2z"/>
        </svg>
      );
    }
    if (title.includes('QR') || title.includes('Generator')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM19 13h2v2h-2zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 15h2v2h-2zM19 17h2v2h-2z"/>
        </svg>
      );
    }
    if (title.includes('Unit') || title.includes('Converter')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      );
    }
    if (title.includes('Translator')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
      );
    }
    if (title.includes('Terminal')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V8h16v10zm-10-1h6v-2h-6v2zM6.5 10.5l1.41 1.41L10.83 9 7.91 6.09 6.5 7.5 8 9l-1.5 1.5z"/>
        </svg>
      );
    }
    if (title.includes('MCP')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 4.24l-1.34 2.69-2.95.43 2.15 2.1-.51 2.95L12 13.77l2.65 1.39-.51-2.95 2.15-2.1-2.95-.43L12 6.24z"/>
        </svg>
      );
    }
    if (title.includes('Therapy')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      );
    }
    if (title.includes('Background') || title.includes('Remover')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          <path d="M12 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" opacity="0.5"/>
        </svg>
      );
    }
    if (title.includes('Plagiarism') || title.includes('Checker')) {
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
          <path d="M15.5 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
    }
    
    // Default icon for any other tools
    return (
      <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    );
  };

  const tools = [
    {
      title: 'Text to Presentation',
      description: 'Convert text into presentation slides.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChtsJoh6mWfORQgwUKcajnhfFf5Wan7nfEKLpw8XmuXMbq17DHgRPS-P5WSMrVpTqifW-HrEAGwRfClecZ09k3vZAa1LjxRbp8kdJqvAKPC0SueaBouUc8GGqO0oQ-CElMPL7tg8wjGSqElL_AV2bbgZBhlVQpgGo9w_5F0tWI66xbNoEUxzG9re1b29p4iunA-7b6u6fd-bSEPTk9uwL7iaew_ChRqHgrezuuPLMnR2OgmoT1hM6fbnMX6ljOiE_Pnc3eM6kFWP9Y',
      link: '/editor',
      category: 'AI'
    },
    {
      title: 'Text Summarizer',
      description: 'Summarize long texts into concise summaries.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7PYGw1dKaYf1pnZqAOGHzg9KYlzRwNeujczoHadgmQ6woOe5PfOMbvCAlHkdh3pvEyCiZgG_nLI-blrVgZ_AUbqg53I5sPpX3T8IY956O5KtEXDxlKfrmSIlUFEchldwXMYKoqz8E7TfEmER1SoiF8GfVb42ScvgIh6ESThpOCRNut_UEYZcjcaL_cFkRYETIgLAWWYQBnXqeV8s5B2zy6mCJcs5Kxwn-7Kg-jhAvrWBIHZX3fhuLqWIgLhWg6UeSqyrZKJWHjl5n',
      link: '/summarizer',
      category: 'Text'
    },
    {
        title: 'File Converter',
        description: 'Convert documents, images, and other files between different formats.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6t8eqIpmlWubaRzfTarfdEWvXm81nvovUc8pF6ew1PZflGw8ju6Jfn50Vg_mRnfAvDV51B5z-PsUm0dSFv6PTTEaK2ea8H1y6K6y_Pajr6XWXYpxzJTWcBuAs42glKaiq5Fba6IKiUDrnI2I9PP5X2FPK1QJFtUcEBwwjrapVESixw__ujLoCJ_2KWo_GiOD3gh1bUhAHi_wBLnYXaumuiin6nGqryNRz2QbXzd0YC0c0kovFSOuTKus-LNcGtqSaYDjQLV7rJekR',
        link: '/converter',
        category: 'Documents'
    },
    {
      title: 'AI Chatbot',
      description: 'Engage with an AI chatbot for various tasks.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBYTCEG-uu12NKmCQYHeDOO4w3yG1BlnH4TxVoqP5tgSpY1X1AeloG6KibodwbVhdiFTA4s3canYMiKHbgpu7r53zDgnde2awzp_jKgslfgbyfNrz426cU_vV21_WnZAo8BWGZTgmR48ifYkkQJ8V0XlyDxTvLkmpvvG4voyYcDVIhfICXZCKGaegjhcA3lAEoEEiPJ6YSoFDgXCJZf8vSRlRL9HcK_e2pNBxIEVXpie8nLFnk_RK1p3vyr6MI3t8TF2vixkXltYHE',
      link: '/chatbot',
      category: 'AI'
    },
    {
      title: 'Productivity Planner',
      description: 'Plan your day and manage your tasks effectively.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkLfWyE2PRFPPEuEAmmK1BDPi1wEhEThoHPOj0dnNdjwlGb_C1tkN69K6QEgIfWPucrCwUEKfF4zVQbFt3Mqabl8CwOobfoNxgZWehzwcQRuH_FO-JdtCVSdE8_ZbBYQlptKkwvgO4MiW6_gu72w56rI8qQnfZasZq-D_GOUMrNRsnHUAPYxHArq7MFpC4nD5HhFiRWvKF_l_LCZ2BDcGzHC6LqfIX_7pdGPpDMAYNI6hKkccSJCrSLkdkW0UaE6oU5OAzWuQtoiM5',
      link: '/productivity-planner',
      category: 'Productivity'
    },
    {
      title: 'Image Resizer',
      description: 'Resize images to desired dimensions.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2TYajeOA8xvQvxqTZVDSy9Jd9brT-Spz3vuTf2C1oyDE3f2ZoPRxp2XxBN3jduoL3KYVVRWi4B_ZaD9Fla4bVMuECUVsL9USuoZbgHhEzb6p8AfgAIP3jXOHMtWaE1nbJAQ_L0wlz750b0ClIM_HvGEidhO7O5bqCf5gVmPs-45xcQkY65d96tMM2OKjouI8MPVI9H97UE1f6xAxThciSg1bWHM1ceb_A3bbwGu6s2suafqO1dzamqws68REgJlGuwC7XlqfX25xE',
      link: '/image-resizer',
      category: 'Documents'
    },
    {
      title: 'Video Trimmer',
      description: 'Trim videos to specific lengths.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYNsNyQx6n-3RkY70qBNWVscPxNXEfeFWFRuEUl79ggsiYvW2WmZduwbNKNr5KgwJM35zuc2xg41ABqvXzN4afMPEeeaFSQC1HSBcdeq-q_pCsstNmCZhR4pZtqU8VWq2nD_DFiMGpe8yeVAXw4sf5SLXC42HCdty0DDZfW-CeKFeJnJNX4P7bwGFO8DGJQ2r1ElY8vOTRV6rteNZfzQQ-OUy5GcsC87gyy934BUdxzAKFtP1hfjJcQ-ni-tydcr7UJ2ko1KHRL_5e',
      link: '/video-trimmer',
      category: 'Documents'
    },
    {
      title: 'Audio Transcriber',
      description: 'Transcribe audio files into text.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe6aECZ0shVbpHcTYimjNfgSu7YDdSBL6ZL0nF6dyTmlF1uzSLMYF09AcwDhflHC3xg5jOcniyi_IqyKZ1IwNgjyBiN_pKLAOtuGZXTQAJtqfv2qwE6Ks6MNX_hwV6TquuuSMKMGaDI1j8e89DkUJRVv0RltTc8qf3grkRLV9CJAh5Mh45AEzwy3MshlPzlmUu-1oY9FVPhcJtUVAkewvk3hFB4bBYZj93PVyepVGk-16tAPKH3heBUOpMrhAbOA6W5136sehF4IeQ',
      link: '/audio-transcriber',
      category: 'AI'
    },
    {
      title: 'Data Analysis',
      description: 'Analyze data sets and extract insights.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpAjv0vMB7XqCY89so4l4RfiApFxsrB_l4nxuyDUJH9G_SMXfNmwvQA2SRddKZ6jhiTuBIYt5txE7iMDcmvemrX9G-Hf8drwNVQTOEG23dz4yMeOqWhkHkvFyFB1144Zf5Wfjy0_9i3NfXzcwz4iOyYZ0vEnyWxWoufzTkG2rbZHsYX6vHtPGlk1R2xNIuHVa9gopH3TurAwfj5CJ7ZVAjrW2Cs_m3dmJnerGvGx74ISyaPSz1ajyLvbM-CCk8BdsfPx8x42wQhTJg',
      link: '/data-analysis',
      category: 'Documents'
    },
    {
      title: 'Color Picker',
      description: 'Generate color palettes for your designs.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq-Ih7_vvb50JxwOE-_FiAGW50b8T0DB1pX5ZzLG85_G2SJQ3amDE_02r7D1aH0VOPpb0fqNYsJkA4M5rlTXQoyrnVI-AE1BBVpU8K2KRRepOsP-KP0zCbd-55gnR-LIdykU8HurkZHCQ5DJoOf8wYkDU8T-OIYryZkrnDKL-i_B2XZAX5hGKdwPABkO1Up6zjKb0uAXoknYGydMS-wAnVqF9f2JuesL-ooEP08jUmpfvztoXqyKyczpZ-8m052Z64am8saAz8MX9c',
      link: '/color-picker',
      category: 'Design'
    },
    {
      title: 'PDF Reader',
      description: 'View and read PDF files directly in your browser.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL48yNkADS0vPqi2sOlwizl6Rk_-hjrSVEokw_Z5HNUoae_osX1K_VMUYw_XbAK2gzBGNk8rRczRfcmSX9qz8rW_HmgCP_AaWFz6BB3zO6rCMuVsh1wDbyB2ZSfFMk_7RUr1LE8k_xVrjjjxymMVEVeU80k0lv7EOex-mcOJeli0Jbv2uKHvjJpdcCUmeHd6V1pNbsq2fsa1dkvB6iXJPIx7Ewbg7g7gVEuU2CM2B50z2kqU3ggFY8C5N2yIth2YW3aV204eSR8fxq',
      link: '/pdf-reader',
      category: 'Documents'
    },
    {
      title: 'PDF Editor',
      description: 'Edit PDF documents with ease.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL48yNkADS0vPqi2sOlwizl6Rk_-hjrSVEokw_Z5HNUoae_osX1K_VMUYw_XbAK2gzBGNk8rRczRfcmSX9qz8rW_HmgCP_AaWFz6BB3zO6rCMuVsh1wDbyB2ZSfFMk_7RUr1LE8k_xVrjjjxymMVEVeU80k0lv7EOex-mcOJeli0Jbv2uKHvjJpdcCUmeHd6V1pNbsq2fsa1dkvB6iXJPIx7Ewbg7g7gVEuU2CM2B50z2kqU3ggFY8C5N2yIth2YW3aV204eSR8fxq',
      link: '/pdf-editor',
      category: 'Documents'
    },
    {
      title: 'DOC Reader',
      description: 'Read Word documents (DOC, DOCX) in your browser.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6t8eqIpmlWubaRzfTarfdEWvXm81nvovUc8pF6ew1PZflGw8ju6Jfn50Vg_mRnfAvDV51B5z-PsUm0dSFv6PTTEaK2ea8H1y6K6y_Pajr6XWXYpxzJTWcBuAs42glKaiq5Fba6IKiUDrnI2I9PP5X2FPK1QJFtUcEBwwjrapVESixw__ujLoCJ_2KWo_GiOD3gh1bUhAHi_wBLnYXaumuiin6nGqryNRz2QbXzd0YC0c0kovFSOuTKus-LNcGtqSaYDjQLV7rJekR',
      link: '/doc-reader',
      category: 'Documents'
    },
    {
      title: 'File Compressor',
      description: 'Compress files to reduce their size.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9r57JhWw0rtl71W_GTy-H9HYZLvJrb4T8oU-J0SLcPig5jq_Hq9oNQpkoQhACk5xbrSS7bbcVXFoXjbDU1EmRfNAg7jWluz3xqFiRf46V6p8GGdZBgc34CmjDpH90dLjISmRWx0xLoAeNvANS-yYuomPTJr2TA5dTYaT8gHhAbVboPGjIdC43-hs4vBRH5Ca3yLwyi-mOnjwOQcffxK5eTThRMXzRweWYWpbuYu6gVYhEWcw6FkmbZzxhd3sz5_RxqDJ3KZsYuFbL',
      link: '/file-compressor',
      category: 'Productivity'
    },
    {
      title: 'QR Code Generator',
      description: 'Create QR codes for various purposes.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDreDfS0s35-KbkUj1iLXQZO-1DgjhAEqjZ1OXfoySLEfVLNWKM8zEsdAXj2Ugz6l7aaINfX4pLPL-71qNASKZ7bKAYRZ1iO6imYnxwmnL0v399XzySxn4PVsm8uzpmsUnQzmYJd5FstOeNdBxH1zkv0ZN0h1JpSuYb7JtSUkge7zMQWYI7rNFfmAvkpgO4HDFXr0lS26nTgcMIpLqVU_cZdwLFHb66QkeJO-vKDqLkMse8WP6T9i4UaTBQiHl5EZHf9dnik11KQyn5',
      link: '/qr-generator',
      category: 'Productivity'
    },
    {
      title: 'Unit Converter',
      description: 'Convert units between different systems.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWLpVfjJRqLZO8rqXJAUsgUA9CxSrs2XFL4e1yhCapS-wGDyG9f6MzkM5T09hT034jyTe6McSyeARuQ-hLhiQ-3vmaf0HB6VUloyAUP7P3kLwli5PaECsbFM8iyjjb7l1Dwzllf_N6NczQgUOA9d8xrwb9eUP2FPiYFNSndnnq4i6EghBApc8GjCzZVOzb88n3JbZQII8ZhOYTq5Y-jDxsvlbClkdzCautUapEFsVluTfJ2G_SWyWm5vor48rUtqPrglOZ1dRSABT0',
      link: '/unit-converter',
      category: 'Productivity'
    },
    {
      title: 'Document Translator',
      description: 'Translate documents into different languages.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdMBIpSpvqCKgB3kDcMoLopk5OT9gz5JsaMTSQ0F1kcFoL4IqGF60PZbu1Zof1LWtgQmgf3DxspVDIEQ0AVL83B2xw7eZ-rKpO6HzCz99Z_hgQmhJF5fIf1xfsGKyhLP6Pxahwxj47Cc976FQA0qw7bRV-V4kLtVwXcjI4aGZt4iCasPT762z0Szik8kbAkOGidSlIveaREVbHaYxIcs3zUaa0Zgt8mmVYm0pKkJtwtIO5T7vEMnhTXPhvfj16pscPds9F8A98U4L2',
      link: '/document-translator',
      category: 'AI'
    },
    {
      title: 'PDF Merger',
      description: 'Merge multiple PDF files into one.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgRPVp5d2qWk2Qf0zGY_H55dMnziI9ah7d31W-0XzeLogjhuQuWY8dgjrSb_wFFVbRg80L3kkyVVJMX61vQ5LojFWQN2jok9mu8ZIF9Xj3-kiWGlWjlXB2Lan10sU6VtpuO58RrS3nC8ALJVSjwmphd60T6MCTZ9NohKYOsoAiw2IlahXC9M9QjzTCqf13PXeccHNq3EacpTHr0619xrJBRDeiF7U30zdz-V0Qci0sC8qcs7kNPIQAEVlVPA5eFBLpN-QEColA8cM_',
      link: '/pdf-merger',
      category: 'Documents'
    },
    {
      title: 'MCP Lite',
      description: 'Build and deploy Model Context Protocols quickly.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChtsJoh6mWfORQgwUKcajnhfFf5Wan7nfEKLpw8XmuXMbq17DHgRPS-P5WSMrVpTqifW-HrEAGwRfClecZ09k3vZAa1LjxRbp8kdJqvAKPC0SueaBouUc8GGqO0oQ-CElMPL7tg8wjGSqElL_AV2bbgZBhlVQpgGo9w_5F0tWI66xbNoEUxzG9re1b29p4iunA-7b6u6fd-bSEPTk9uwL7iaew_ChRqHgrezuuPLMnR2OgmoT1hM6fbnMX6ljOiE_Pnc3eM6kFWP9Y',
      link: '/mcp-lite',
      category: 'AI'
    },
    {
      title: 'Terminal',
      description: 'Web-based terminal emulator with filesystem simulation.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgRPVp5d2qWk2Qf0zGY_H55dMnziI9ah7d31W-0XzeLogjhuQuWY8dgjrSb_wFFVbRg80L3kkyVVJMX61vQ5LojFWQN2jok9mu8ZIF9Xj3-kiWGlWjlXB2Lan10sU6VtpuO58RrS3nC8ALJVSjwmphd60T6MCTZ9NohKYOsoAiw2IlahXC9M9QjzTCqf13PXeccHNq3EacpTHr0619xrJBRDeiF7U30zdz-V0Qci0sC8qcs7kNPIQAEVlVPA5eFBLpN-QEColA8cM_',
      link: '/terminal',
      category: 'Developer'
    },
    {
      title: 'Basic Agent',
      description: 'Intelligent AI assistant for complex tasks and analysis.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBYTCEG-uu12NKmCQYHeDOO4w3yG1BlnH4TxVoqP5tgSpY1X1AeloG6KibodwbVhdiFTA4s3canYMiKHbgpu7r53zDgnde2awzp_jKgslfgbyfNrz426cU_vV21_WnZAo8BWGZTgmR48ifYkkQJ8V0XlyDxTvLkmpvvG4voyYcDVIhfICXZCKGaegjhcA3lAEoEEiPJ6YSoFDgXCJZf8vSRlRL9HcK_e2pNBxIEVXpie8nLFnk_RK1p3vyr6MI3t8TF2vixkXltYHE',
      link: '/basic-agent',
      category: 'AI'
    },
    {
      title: 'Therapy AI Agent',
      description: 'AI-powered mental health support and therapeutic guidance.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq-Ih7_vvb50JxwOE-_FiAGW50b8T0DB1pX5ZzLG85_G2SJQ3amDE_02r7D1aH0VOPpb0fqNYsJkA4M5rlTXQoyrnVI-AE1BBVpU8K2KRRepOsP-KP0zCbd-55gnR-LIdykU8HurkZHCQ5DJoOf8wYkDU8T-OIYryZkrnDKL-i_B2XZAX5hGKdwPABkO1Up6zjKb0uAXoknYGydMS-wAnVqF9f2JuesL-ooEP08jUmpfvztoXqyKyczpZ-8m052Z64am8saAz8MX9c',
      link: '/therapy-agent',
      category: 'Health'
    },
    {
      title: 'Real Terminal',
      description: 'Full development environment with Python, Node.js, Git & OPFS persistence.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgRPVp5d2qWk2Qf0zGY_H55dMnziI9ah7d31W-0XzeLogjhuQuWY8dgjrSb_wFFVbRg80L3kkyVVJMX61vQ5LojFWQN2jok9mu8ZIF9Xj3-kiWGlWjlXB2Lan10sU6VtpuO58RrS3nC8ALJVSjwmphd60T6MCTZ9NohKYOsoAiw2IlahXC9M9QjzTCqf13PXeccHNq3EacpTHr0619xrJBRDeiF7U30zdz-V0Qci0sC8qcs7kNPIQAEVlVPA5eFBLpN-QEColA8cM_',
      link: '/real-terminal',
      category: 'Developer'
    },
    {
      title: 'Background Remover',
      description: 'Remove backgrounds from images instantly using AI. Perfect for profile pictures and product photos.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2TYajeOA8xvQvxqTZVDSy9Jd9brT-Spz3vuTf2C1oyDE3f2ZoPRxp2XxBN3jduoL3KYVVRWi4B_ZaD9Fla4bVMuECUVsL9USuoZbgHhEzb6p8AfgAIP3jXOHMtWaE1nbJAQ_L0wlz750b0ClIM_HvGEidhO7O5bqCf5gVmPs-45xcQkY65d96tMM2OKjouI8MPVI9H97UE1f6xAxThciSg1bWHM1ceb_A3bbwGu6s2suafqO1dzamqws68REgJlGuwC7XlqfX25xE',
      link: '/background-remover',
      category: 'AI'
    },
    {
      title: 'Plagiarism Checker',
      description: 'Detect copied content and ensure originality with advanced plagiarism detection algorithms.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdMBIpSpvqCKgB3kDcMoLopk5OT9gz5JsaMTSQ0F1kcFoL4IqGF60PZbu1Zof1LWtgQmgf3DxspVDIEQ0AVL83B2xw7eZ-rKpO6HzCz99Z_hgQmhJF5fIf1xfsGKyhLP6Pxahwxj47Cc976FQA0qw7bRV-V4kLtVwXcjI4aGZt4iCasPT762z0Szik8kbAkOGidSlIveaREVbHaYxIcs3zUaa0Zgt8mmVYm0pKkJtwtIO5T7vEMnhTXPhvfj16pscPds9F8A98U4L2',
      link: '/plagiarism-checker',
      category: 'Text'
    }
  ];

  return (
    <div 
      className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden" 
      style={{ 
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
        backgroundImage: 'url("/images/bg_image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full page overlay for text readability */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
      <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/40 shadow-lg">
                <p className="text-[#1a1a1a] tracking-light text-[32px] font-bold leading-tight min-w-72 drop-shadow-lg">Explore Our Tools</p>
              </div>
            </div>
             <div className="px-4 py-3">
                {/* Filters can be added here */}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 p-4">
              {tools.map((tool, index) => (
                <Link to={tool.link} key={index} className="group">
                  <div className="flex flex-col gap-4 p-6 bg-white/40 backdrop-blur-md border border-white/50 rounded-xl hover:bg-white/50 hover:border-white/60 transition-all duration-300 group-hover:scale-105 shadow-xl">
                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-16 h-16 bg-white/50 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                      {getToolIcon(tool.title, tool.category)}
                    </div>
                    
                    {/* Tool Info */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[#1a1a1a] text-lg font-bold leading-tight drop-shadow-sm">{tool.title}</h3>
                        <span className="px-3 py-1 text-xs font-semibold bg-[#e67722]/30 text-[#8b3a00] rounded-full border border-[#e67722]/50 backdrop-blur-sm shadow-sm">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-[#2a2a2a] text-sm font-medium leading-relaxed drop-shadow-sm bg-white/20 p-3 rounded-lg border border-white/30">{tool.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ToolsPage;
