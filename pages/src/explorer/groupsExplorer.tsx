import { useState, useEffect, useCallback, useMemo } from "react";
import * as React from "react";
import { JSONExplorer } from "./jsonExplorer";
import * as styles from "./groupsExplorer.less";

export const buildJsonlikeGroups = (raw: string) => {
    let source = raw;
    const boundaries = {
        "{": "}",
        "[": "]"
    };

    const groups = [] as { key: string; value: string }[];
    let index = 0;
    type LeftBoundaries = keyof typeof boundaries;
    const leftBoundaries = Object.keys(boundaries);

    let lastBoundary: LeftBoundaries = null;

    while (index < source.length) {
        let key = "";
        for (index = 0; index < source.length; index++) {
            if (leftBoundaries.includes(source[index])) {
                key = source.slice(0, index);
                source = source.slice(index);
                break;
            }
        }
        const stack = [] as LeftBoundaries[];
        index = 0;
        for (let inString = false; index < source.length; index++) {
            let char = source[index];
            if (!inString) {
                if (char === '"') {
                    inString = false;
                    continue;
                }
                if (char === "\\") {
                    index++;
                    continue;
                }
                if (leftBoundaries.includes(char)) {
                    stack.push(char as LeftBoundaries);
                    lastBoundary = char as LeftBoundaries;
                    continue;
                }
                if (char === boundaries[lastBoundary]) {
                    stack.pop();
                    lastBoundary = stack[stack.length - 1];
                    if (!stack.length) {
                        groups.push({ key, value: source.slice(0, index + 1) });
                        source = source.slice(index + 1);
                        index = 0;

                        break;
                    }
                    continue;
                }
            } else {
                if (char === '"') {
                    inString = false;
                }
            }
        }
    }

    return {
        raw,
        groups: groups.map(({ key, value }) => ({
            key: key.trim(),
            value
        })),
        rest: source.trim(),
    };
};

interface GroupsExplorerProps {
    value: ReturnType<typeof buildJsonlikeGroups>,
    index: number,
}

export const GroupsExplorer = (props: GroupsExplorerProps) => {
    const { value, index } = props;

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        setCurrent(0);
    }, [index]);

    const onClickGroup = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        setCurrent(+e.currentTarget.getAttribute("data-key") || 0);
    }, []);

    const groups = useMemo(() => {
        return [
            {
                key: '',
                title: '(raw)',
                value: value.raw,

            },
            ...value.groups.map(group => ({
                ...group,
                title: group.key || '(无标题)'
            })),
            ...value.rest ? [{
                key: '',
                title: '(tail)',
                value: value.rest,
            }] : [],
        ];
    }, [value]);

    const sideNode = useMemo(() => {
        return (
            <ul className={styles.sideBar}>
                {
                    groups.map((group, i) => {
                        const css = [styles.sideBarItem];
                        if (!group.key) {
                            css.push(styles.fade);
                        }
                        if (i === current) {
                            css.push(styles.selected);
                        }
                        return (
                            <li className={css.join(' ')} key={i} data-key={i} onClick={onClickGroup}>{group.title}</li>
                        )
                    })
                }
            </ul>
        );
    }, [groups, current]);

    const ContentNode = useMemo(() => {
        const groupContent = groups[current].value;
        return (
            <JSONExplorer
                value={groupContent}
            />
        )
    }, [current, groups]);

    return <div className={styles.container}>
        {sideNode}
        {ContentNode}
    </div>
}