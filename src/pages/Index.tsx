import Layout from "../components/Layout";
import Feed from "../components/Feed";
import { WelcomeModal } from "../components/WelcomeModal";

const Index = () => {
  return (
    <Layout>
      <WelcomeModal />
      <Feed />
    </Layout>
  );
};

export default Index;