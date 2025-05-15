import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#21222D] border-t border-neutral-200 dark:border-neutral-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 mr-2 text-[#F7931A]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
              <span className="font-semibold text-xl tracking-tight">BitTrackr</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Providing transparency and security in the Bitcoin ecosystem through community-powered intelligence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.608 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1634-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-500 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.5 6.376-.5 6.376s-.012.188-.088.287a.512.512 0 0 1-.287.196c-.152.045-.275.07-.394.072-.23.004-.407-.035-.59-.122-.225-.109-.494-.258-.739-.385-1.135-.59-2.903-1.587-2.931-1.6l-.41-.268s1.62-1.48 2.39-2.145c.695-.6 1.069-.923 1.19-1.023.212-.175.91-.692-.057-.932-.635-.16-1.735.881-1.735.881s-1.453.88-2.638 1.603c-.271.164-.543.153-.762.113a2.835 2.835 0 0 1-.728-.219 2.562 2.562 0 0 1-.724-.44 7.39 7.39 0 0 1-.516-.4c.068-.087.336-.192.336-.192s2.126-.936 3.16-1.402c1-.45 2.032-.93 2.851-1.226 1.317-.48 2.913-.735 2.913-.735s.121-.028.312-.032z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Documentation</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">API Reference</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Guides & Tutorials</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Security Insights</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">About Us</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Careers</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Press Kit</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Cookie Policy</a></li>
              <li><a href="#" className="text-neutral-600 hover:text-primary dark:text-neutral-400 dark:hover:text-primary">Responsible Disclosure</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} BitTrackr. All rights reserved.
          </div>
          <div>
            Data provided for informational purposes only. Not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
