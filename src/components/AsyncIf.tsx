import React, { ReactNode, Suspense } from "react";

type IProps = {
  condition: () => Promise<boolean>;
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
};

export function AsyncIf(props: IProps) {
  return (
    <Suspense fallback={props.loadingFallback}>
      <SuspendedComponent
        condition={props.condition}
        otherwise={props.otherwise}
      >
        {props.children}
      </SuspendedComponent>
    </Suspense>
  );
}

async function SuspendedComponent(props: Omit<IProps, "loadingFallback">) {
  return (await props.condition()) ? props.children : props.otherwise;
}
