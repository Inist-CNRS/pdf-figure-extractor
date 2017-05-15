    #!/bin/bash
    DIR=/home/labroche/Project/dataset-xsmall/all/
    line=0

    let " line = ($RANDOM % `ls -R $DIR | wc -l`) + 1 "

    ls -R $DIR | nl | while read a b
    do
        {
        [ "$a" = "$line" ] && cp "$DIR"/"$b" /home/labroche/Project/parseDocument/test/pdf/"$b" && echo "$b" && break;
        }
    done

    exit 0
