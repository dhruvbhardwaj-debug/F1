import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
const MainLayout = async ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full flex">
      <div className="md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
        <NavigationSidebar />
      </div>
      <main className="md:pl-[72px] flex-1 h-full">
        {children}
      </main>
    </div>
   );
}
 
export default MainLayout;