import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ToolsPage: React.FC = () => {
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
      link: '#',
      category: 'AI'
    },
    {
      title: 'Productivity Planner',
      description: 'Plan your day and manage your tasks effectively.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkLfWyE2PRFPPEuEAmmK1BDPi1wEhEThoHPOj0dnNdjwlGb_C1tkN69K6QEgIfWPucrCwUEKfF4zVQbFt3Mqabl8CwOobfoNxgZWehzwcQRuH_FO-JdtCVSdE8_ZbBYQlptKkwvgO4MiW6_gu72w56rI8qQnfZasZq-D_GOUMrNRsnHUAPYxHArq7MFpC4nD5HhFiRWvKF_l_LCZ2BDcGzHC6LqfIX_7pdGPpDMAYNI6hKkccSJCrSLkdkW0UaE6oU5OAzWuQtoiM5',
      link: '#',
      category: 'Productivity'
    },
    {
      title: 'Image Resizer',
      description: 'Resize images to desired dimensions.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2TYajeOA8xvQvxqTZVDSy9Jd9brT-Spz3vuTf2C1oyDE3f2ZoPRxp2XxBN3jduoL3KYVVRWi4B_ZaD9Fla4bVMuECUVsL9USuoZbgHhEzb6p8AfgAIP3jXOHMtWaE1nbJAQ_L0wlz750b0ClIM_HvGEidhO7O5bqCf5gVmPs-45xcQkY65d96tMM2OKjouI8MPVI9H97UE1f6xAxThciSg1bWHM1ceb_A3bbwGu6s2suafqO1dzamqws68REgJlGuwC7XlqfX25xE',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'Video Trimmer',
      description: 'Trim videos to specific lengths.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYNsNyQx6n-3RkY70qBNWVscPxNXEfeFWFRuEUl79ggsiYvW2WmZduwbNKNr5KgwJM35zuc2xg41ABqvXzN4afMPEeeaFSQC1HSBcdeq-q_pCsstNmCZhR4pZtqU8VWq2nD_DFiMGpe8yeVAXw4sf5SLXC42HCdty0DDZfW-CeKFeJnJNX4P7bwGFO8DGJQ2r1ElY8vOTRV6rteNZfzQQ-OUy5GcsC87gyy934BUdxzAKFtP1hfjJcQ-ni-tydcr7UJ2ko1KHRL_5e',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'Audio Transcriber',
      description: 'Transcribe audio files into text.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe6aECZ0shVbpHcTYimjNfgSu7YDdSBL6ZL0nF6dyTmlF1uzSLMYF09AcwDhflHC3xg5jOcniyi_IqyKZ1IwNgjyBiN_pKLAOtuGZXTQAJtqfv2qwE6Ks6MNX_hwV6TquuuSMKMGaDI1j8e89DkUJRVv0RltTc8qf3grkRLV9CJAh5Mh45AEzwy3MshlPzlmUu-1oY9FVPhcJtUVAkewvk3hFB4bBYZj93PVyepVGk-16tAPKH3heBUOpMrhAbOA6W5136sehF4IeQ',
      link: '#',
      category: 'AI'
    },
    {
      title: 'Data Analysis',
      description: 'Analyze data sets and extract insights.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpAjv0vMB7XqCY89so4l4RfiApFxsrB_l4nxuyDUJH9G_SMXfNmwvQA2SRddKZ6jhiTuBIYt5txE7iMDcmvemrX9G-Hf8drwNVQTOEG23dz4yMeOqWhkHkvFyFB1144Zf5Wfjy0_9i3NfXzcwz4iOyYZ0vEnyWxWoufzTkG2rbZHsYX6vHtPGlk1R2xNIuHVa9gopH3TurAwfj5CJ7ZVAjrW2Cs_m3dmJnerGvGx74ISyaPSz1ajyLvbM-CCk8BdsfPx8x42wQhTJg',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'Color Picker',
      description: 'Generate color palettes for your designs.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq-Ih7_vvb50JxwOE-_FiAGW50b8T0DB1pX5ZzLG85_G2SJQ3amDE_02r7D1aH0VOPpb0fqNYsJkA4M5rlTXQoyrnVI-AE1BBVpU8K2KRRepOsP-KP0zCbd-55gnR-LIdykU8HurkZHCQ5DJoOf8wYkDU8T-OIYryZkrnDKL-i_B2XZAX5hGKdwPABkO1Up6zjKb0uAXoknYGydMS-wAnVqF9f2JuesL-ooEP08jUmpfvztoXqyKyczpZ-8m052Z64am8saAz8MX9c',
      link: '#',
      category: 'Design'
    },
    {
      title: 'PDF Reader',
      description: 'View and read PDF files directly in your browser.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL48yNkADS0vPqi2sOlwizl6Rk_-hjrSVEokw_Z5HNUoae_osX1K_VMUYw_XbAK2gzBGNk8rRczRfcmSX9qz8rW_HmgCP_AaWFz6BB3zO6rCMuVsh1wDbyB2ZSfFMk_7RUr1LE8k_xVrjjjxymMVEVeU80k0lv7EOex-mcOJeli0Jbv2uKHvjJpdcCUmeHd6V1pNbsq2fsa1dkvB6iXJPIx7Ewbg7g7gVEuU2CM2B50z2kqU3ggFY8C5N2yIth2YW3aV204eSR8fxq',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'PDF Editor',
      description: 'Edit PDF documents with ease.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL48yNkADS0vPqi2sOlwizl6Rk_-hjrSVEokw_Z5HNUoae_osX1K_VMUYw_XbAK2gzBGNk8rRczRfcmSX9qz8rW_HmgCP_AaWFz6BB3zO6rCMuVsh1wDbyB2ZSfFMk_7RUr1LE8k_xVrjjjxymMVEVeU80k0lv7EOex-mcOJeli0Jbv2uKHvjJpdcCUmeHd6V1pNbsq2fsa1dkvB6iXJPIx7Ewbg7g7gVEuU2CM2B50z2kqU3ggFY8C5N2yIth2YW3aV204eSR8fxq',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'DOC Reader',
      description: 'Read Word documents (DOC, DOCX) in your browser.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6t8eqIpmlWubaRzfTarfdEWvXm81nvovUc8pF6ew1PZflGw8ju6Jfn50Vg_mRnfAvDV51B5z-PsUm0dSFv6PTTEaK2ea8H1y6K6y_Pajr6XWXYpxzJTWcBuAs42glKaiq5Fba6IKiUDrnI2I9PP5X2FPK1QJFtUcEBwwjrapVESixw__ujLoCJ_2KWo_GiOD3gh1bUhAHi_wBLnYXaumuiin6nGqryNRz2QbXzd0YC0c0kovFSOuTKus-LNcGtqSaYDjQLV7rJekR',
      link: '#',
      category: 'Documents'
    },
    {
      title: 'File Compressor',
      description: 'Compress files to reduce their size.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9r57JhWw0rtl71W_GTy-H9HYZLvJrb4T8oU-J0SLcPig5jq_Hq9oNQpkoQhACk5xbrSS7bbcVXFoXjbDU1EmRfNAg7jWluz3xqFiRf46V6p8GGdZBgc34CmjDpH90dLjISmRWx0xLoAeNvANS-yYuomPTJr2TA5dTYaT8gHhAbVboPGjIdC43-hs4vBRH5Ca3yLwyi-mOnjwOQcffxK5eTThRMXzRweWYWpbuYu6gVYhEWcw6FkmbZzxhd3sz5_RxqDJ3KZsYuFbL',
      link: '#',
      category: 'Productivity'
    },
    {
      title: 'QR Code Generator',
      description: 'Create QR codes for various purposes.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDreDfS0s35-KbkUj1iLXQZO-1DgjhAEqjZ1OXfoySLEfVLNWKM8zEsdAXj2Ugz6l7aaINfX4pLPL-71qNASKZ7bKAYRZ1iO6imYnxwmnL0v399XzySxn4PVsm8uzpmsUnQzmYJd5FstOeNdBxH1zkv0ZN0h1JpSuYb7JtSUkge7zMQWYI7rNFfmAvkpgO4HDFXr0lS26nTgcMIpLqVU_cZdwLFHb66QkeJO-vKDqLkMse8WP6T9i4UaTBQiHl5EZHf9dnik11KQyn5',
      link: '#',
      category: 'Productivity'
    },
    {
      title: 'Unit Converter',
      description: 'Convert units between different systems.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWLpVfjJRqLZO8rqXJAUsgUA9CxSrs2XFL4e1yhCapS-wGDyG9f6MzkM5T09hT034jyTe6McSyeARuQ-hLhiQ-3vmaf0HB6VUloyAUP7P3kLwli5PaECsbFM8iyjjb7l1Dwzllf_N6NczQgUOA9d8xrwb9eUP2FPiYFNSndnnq4i6EghBApc8GjCzZVOzb88n3JbZQII8ZhOYTq5Y-jDxsvlbClkdzCautUapEFsVluTfJ2G_SWyWm5vor48rUtqPrglOZ1dRSABT0',
      link: '#',
      category: 'Productivity'
    },
    {
      title: 'Document Translator',
      description: 'Translate documents into different languages.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdMBIpSpvqCKgB3kDcMoLopk5OT9gz5JsaMTSQ0F1kcFoL4IqGF60PZbu1Zof1LWtgQmgf3DxspVDIEQ0AVL83B2xw7eZ-rKpO6HzCz99Z_hgQmhJF5fIf1xfsGKyhLP6Pxahwxj47Cc976FQA0qw7bRV-V4kLtVwXcjI4aGZt4iCasPT762z0Szik8kbAkOGidSlIveaREVbHaYxIcs3zUaa0Zgt8mmVYm0pKkJtwtIO5T7vEMnhTXPhvfj16pscPds9F8A98U4L2',
      link: '#',
      category: 'AI'
    },
    {
      title: 'PDF Merger',
      description: 'Merge multiple PDF files into one.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgRPVp5d2qWk2Qf0zGY_H55dMnziI9ah7d31W-0XzeLogjhuQuWY8dgjrSb_wFFVbRg80L3kkyVVJMX61vQ5LojFWQN2jok9mu8ZIF9Xj3-kiWGlWjlXB2Lan10sU6VtpuO58RrS3nC8ALJVSjwmphd60T6MCTZ9NohKYOsoAiw2IlahXC9M9QjzTCqf13PXeccHNq3EacpTHr0619xrJBRDeiF7U30zdz-V0Qci0sC8qcs7kNPIQAEVlVPA5eFBLpN-QEColA8cM_',
      link: '#',
      category: 'Documents'
    }
  ];

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4] group/design-root overflow-x-hidden" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#382f29] tracking-light text-[32px] font-bold leading-tight min-w-72">Explore Our Tools</p>
            </div>
             <div className="px-4 py-3">
                {/* Filters can be added here */}
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 p-4">
              {tools.map((tool, index) => (
                <Link to={tool.link} key={index} className="flex flex-col gap-3 pb-3 group">
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url("${tool.imageUrl}")` }}
                  ></div>
                  <div>
                    <p className="text-[#382f29] text-base font-medium leading-normal">{tool.title}</p>
                    <p className="text-[#b8a99d] text-sm font-normal leading-normal">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
    </div>
  );
};

export default ToolsPage;
