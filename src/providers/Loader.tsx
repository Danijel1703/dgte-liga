import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";

interface ILoaderContext {
  loading: boolean;
  setLoading: Dispatch<boolean>;
}

const LoaderContext = createContext<ILoaderContext | null>(null);

export const useLoader = () => useContext(LoaderContext) as ILoaderContext;

export const Loader = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
    </LoaderContext.Provider>
  );
};
